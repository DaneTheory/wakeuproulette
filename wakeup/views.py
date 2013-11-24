from django.shortcuts import render
from django.shortcuts import render_to_response
from django import forms
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth.models import User
from models import Conference, Call
from django.core.management import call_command
from django.db import transaction
from twilio.rest import TwilioRestClient
from django.conf import settings
from datetime import datetime
from accounts.models import UserProfile
from wakeup.tools.toolbox import send_async_mail


# Global Variables
CALL_LIMIT = 20
WELCOME_LIMIT = 10
HOLD_LIMIT = 10
TIMEOUT = 15
WAITING_ROOM_MAX = 7

RE_DIAL_LIMIT = 5
REDIRECT_LIMIT = 3

CONFERENCE_SCHEDULE_DELIMITER = ':'


@transaction.commit_manually
def flush_transaction():
    transaction.commit()


def home(request):
    return render(request, 'index.html')

def as_date(schedule):
    return datetime.strptime(schedule, "%d:%m:%y:%H:%M:%S")

def find_match(schedule, call):
    print "Finding match for: ", call.user.username

    # Refresh Database Changes
    flush_transaction()
    # TODO Now we are only comparing opposite gender - we need to add functionality to match by anything
    allmatches = Call.objects.filter(datecreated=as_date(schedule), matched=False).exclude(user__profile__gender=call.user.profile.gender).order_by('?')
    print "Matches found are: ", allmatches

    if allmatches:
        return allmatches[0]
    else:
        return None
#    allmatches = UserProfile.objects.filter(alarmon=False, active=True, booked=False).exclude(gender=profile.gender)


def get_active_waiting_room(schedule):
    dateSchedule = as_date(schedule)
    # Refreshing database
    flush_transaction()
    try:
        allWaitingRooms = Conference.objects.filter(datecreated=dateSchedule, maxcapacity__gt=2)
        print "All waiting rooms: ", allWaitingRooms

        # Find free waiting room
        for waiting in allWaitingRooms:
            if waiting.available():
                print "Waiting room chosen: ", waiting.pk
                return waiting

    # No free waiting rooms so create one
    except Conference.DoesNotExist:
        pass # None found, so create one

    waiting = Conference()
    waiting.datecreated = dateSchedule
    waiting.maxcapacity = WAITING_ROOM_MAX
    waiting.save()
    return waiting


def send_to_conference_room(username, confname, schedule, record):
    say = "We have found you a match! You are now connected with " + username + "! Press Star if you wish to end the conversation immediately and rate your wake up buddy."
    return render_to_response("twilioresponse.xml", {     'say' :say
                                                        , 'confname' : confname
                                                        , 'timelimit' : CALL_LIMIT
                                                        , 'finishrequest' : schedule
                                                        , 'hanguponstar' : True
                                                        , 'record' : record
                                                        , 'beep' : True
                                                    })

def send_to_waiting_room(timelimit, schedule, confname, gather=None, say=None):
    print "Sending to conference room", confname, "with schedule", schedule
    return render_to_response("twilioresponse.xml", { 'say' :say
                                                    , 'gather' : gather
                                                    , 'wakeuprequest' : schedule
                                                    , 'confname' : confname
                                                    , 'timelimit' : timelimit
                                                    , 'record' : False
                                                    , 'beep' : False })

#@transaction.commit_on_success
def match_or_send_to_waiting_room(call, schedule):

    # Refreshing database object
    flush_transaction()
    call.reload()

    if call.matched:
        other = call.conference.call_set.exclude(pk=call.pk)[0]

        return send_to_conference_room(other.user.username, other.conference.pk, schedule, other.user.profile.recording)

        # TODO Handle if the other person drops the call when user might still be in waiting room


    matchcall = find_match(schedule, call)
    if matchcall:
        conf = Conference()
        conf.maxcapacity = 2
        conf.datecreated = as_date(schedule)
        conf.save()

        call.conference = conf
        call.matched = True

        matchcall.conference = conf
        matchcall.matched = True

        call.save()
        matchcall.save()

        return send_to_conference_room(matchcall.user.username, conf.pk, schedule, call.user.profile.recording)

    else:
        return send_to_waiting_room(  HOLD_LIMIT
                                    , schedule
                                    , call.user.username
                                    , False
                                    , "Please bare with us - we'll find the best match for you!")

@csrf_exempt
def wakeUpRequest(request, schedule):
    # Removing any trailing '/'
    schedule = schedule.replace("/", "")

    post = request.POST

    print "Handling WAKEUP request"
    print "CallStatus: ", post['CallStatus']
    print "Phone: ", post['To']
    if 'AnsweredBy' in post: print "AnsweredBy: ", post['AnsweredBy']
    if 'DialCallStatus' in post: print "DialCallStatus: ", post['DialCallStatus']
    if 'RecordingUrl' in post:
        print "Recoding URL: ", post['RecordingUrl']
        print "Recording Duration: ", post['RecordingDuration']

    phone = post['To']

    # Refresh Database Changes
    flush_transaction()
    # Reason why we get the call rather than the profile:
    # Whenever we select call.user.profile we use the cached version rather than querying the database
    call = Call.objects.filter(datecreated=as_date(schedule)).get(user__profile__phone=phone)

    if 'AnsweredBy' in post and post['AnsweredBy'] == 'human' and post['CallStatus'] == 'in-progress':
        data = None

        # If user is currently waiting
        if 'DialCallStatus' in post and post['DialCallStatus'] == 'answered':
            print "Person is still awake, and he's still waiting!"

            #Check if we have exceeded the waiting redirect limits
            if call.retries > REDIRECT_LIMIT:
                # The user has reached the limit of redials, so hang up
                print "WAITING LIMIT DONE - HANGING UP NAO"
                say = "We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day! Good bye!"
                data = render_to_response("twilioresponse.xml", { 'say' :say, 'hangup' : True })
            else:
                print "REDIRECTING TO WAITING ROOM"
                call.retries = call.retries + 1
                call.save()
                data = match_or_send_to_waiting_room(call, schedule)

        # Else, person has just woken up
        else:
            print "Person has just waken up and answered!"

            waiting = get_active_waiting_room(schedule)

            # Setting the redials to zero - we'll use this count to limit the waiting time
            call.retries = 0
            call.matched = False
            call.conference = waiting
            call.save()

            data = send_to_waiting_room(  WELCOME_LIMIT
                                        , schedule
                                        , waiting.pk
                                        , "Welcome to Wake Up Roulette! We'll now send you to a waiting room with everyone - if you'd rather wait in a private room, press any number now.")

        print '\n'

    else:
        print "Something unexpected happened! Check what was it:"
        for var in post:
            print var, post[var]
        print '\n'
        data = render_to_response("twilioresponse.xml")

    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def answerCallback(request, schedule):
    post = request.POST
    phone = post['To']

    # Refresh Database Changes
    flush_transaction()
    call = Call.objects.filter(datecreated=as_date(schedule)).get(user__profile__phone=phone)

    print "####### SCHEDULE #####   ", schedule
    print "\n"
    print "Handling ANSWER CALLBACK request"
    print "CallStatus: ", post['CallStatus']
    print "Phone: ", post['To']
    if 'AnsweredBy' in post: print "AnsweredBy: ", post['AnsweredBy']
    if 'DialCallStatus' in post: print "DialCallStatus: ", post['DialCallStatus']
    if 'RecordingUrl' in post:
        print "Recoding URL: ", post['RecordingUrl']
        print "Recording Duration: ", post['RecordingDuration']
    print "\n"


    # TODO DEAL WITH CALLS ANSWERED BY MACHINE FOR NOW, WE'LL HANDLE THEM AS NO-ANSWERS
    # If dude didn't answer or it was a voicemail (probably no signal or just bad handled call), then call him again
    if post['CallStatus'] == 'no-answer' or post['CallStatus'] == 'busy' or (post['CallStatus'] == 'completed' and post['AnsweredBy'] == 'machine'):
        # Make sure that number of re-dials has not been exceeded
        if call.retries >= RE_DIAL_LIMIT:
            print "LIMIT REDIALS. HANGING UP..."
            data = render_to_response("twilioresponse.xml")

            # Re-setting redial count
            call.retries = 0
            call.save()
        else:
            # TODO: THIS SHOULD REALLY BE DEALT WITH A SIMPLE XMLRESPONSE RATHER THAN API CALL
            print "REDIALING...."

            account = "AC8f68f68ffac59fd5afc1a3317b1ffdf8"
            token = "5a556d4a9acf96753850c39111646ca4"
            client = TwilioRestClient(account, token)
            fromnumber = "+441279702159"
            confurl = settings.WEB_ROOT + 'wakeuprequest/' + schedule
            noanswerurl = settings.WEB_ROOT + 'answercallback/' + schedule
            fallbackurl = settings.WEB_ROOT + 'fallback/' + schedule
            print "No answer, calling again: ", phone, confurl
            call1 = client.calls.create(
                  url=confurl
                , to = phone
                , from_ = fromnumber
                , timeout = TIMEOUT
                , fallback_method = 'POST'
                , fallback_url=fallbackurl
                , if_machine = 'Hangup'
                , status_callback = noanswerurl
                , status_method = 'Post'
                , record = True)
            data = render_to_response("twilioresponse.xml")

            call.retries = call.retries + 1
            call.save()

    elif post['CallStatus'] == 'completed' and post['AnsweredBy'] == 'human':
        print "Call has been completed!"
        print "Conference Room", schedule
        print '\n'

        # Resetting all wakeup flags
        call.retries = 0
        call.save()
        call.user.profile.save()

        if call.conference:
            conf = call.conference.call_set

            print "Call set:", conf
        else:
            print "NO CONFERENCE!"

        data = render_to_response("twilioresponse.xml")

    else:
        print "Something unexpected happened! Check what was it:"
        for var in post:
            print var, post[var]
        print '\n'
        data = render_to_response("twilioresponse.xml")

    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def sendToPrivateRoom(request, schedule):
    print "PRIVATE ROOM REQUEST!"
    post = request.POST

    phone = post['To']

    # Refresh Database Changes
    flush_transaction()
    call = Call.objects.filter(datecreated=as_date(schedule)).get(user__profile__phone=phone)

    # Check if call has been matched
    if call.matched:

    call.conference = None
    call.user.profile.roomdesired = True

    call.save()
    call.user.profile.save()

    data = send_to_waiting_room(  HOLD_LIMIT
                                , schedule
                                , call.user.username
                                , False
                                , "We'll send you to a private room while we connect you with an awesome person!")

    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def ratingRequest(request, schedule):
    print "RATING REQUEST!"
    post = request.POST

    # TODO HANDLE THIS CASE
    if not 'Digits' in post:
        return

    # Refresh Database Changes
    flush_transaction()
    phone = post['To']

    # TODO Improve efficiency of this
    call = Call.objects.filter(datecreated=as_date(schedule)).get(user__profile__phone=phone)

    goodbye = "Thank you for your rating! We hope you had a great time! See you soon!"
    rating = ""
    gatherurl = ""

    try:
        other = call.conference.call_set.exclude(pk=call.pk)[0].user.profile

        digit = post['Digits']

        # Thumbs up:
        if digit == '1':
            print "+1 reputation to", other.user.username
            other.reputation = other.reputation + 1
        # Thumbs down:
        elif digit == '2':
            print "-1 reputation to", other.user.username
            other.reputation = other.reputation - 1
        # Reported
        elif digit == '0':
            # TODO HANDLE REPORTING
            goodbye =  other.user.username + " has been reported. We apologize in behalf of your wake up buddy! Please contact the Wake Up Roulette Team if you need anything! We'd love to hear from you!"
        else:
            # TODO HANDLE WRONG TYPING: SHOULD WE TRY AGAIN OR LEAVE IT?
            print "Incorrect number, user pressed" , digit
            gatherurl = schedule
            rating = "We're sorry, we didn't get that! Please press ONE to give him a thumbs up. Press TWO to give him a thumbs down. Press ZERO to report your wake up buddy."

        data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                            , 'rating' : rating
                                                            , 'ratingurl' : gatherurl
                                                            , 'goodbye' : goodbye
                                                        })
    except Call.DoesNotExist:
        # TODO HANDLE WHEN CONFERENCES DON'T EXIST
        print "EXCEPT - CONFERENCE SHOULD EXIST"
        data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                            , 'goodbye' : goodbye
                                                        })

    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def finishRequest(request, schedule):
    print "FINISH REQUEST"

    post = request.POST

    # Refresh Database Changes
    flush_transaction()
    phone = post['To']

    # If there is a RecordingURL, the conference terminated successfully and a recording was requested
    if 'RecordingUrl' in post:
        # Resetting flags for profile as conversation has ended

        try:
            call = Call.objects.filter(datecreated=as_date(schedule)).get(user__profile__phone=phone)


            # Check for recording
            rURL = post['RecordingUrl']
            rDuration = post['RecordingDuration']

            call.recordingurl = rURL
            call.recordingduration = rDuration
            call.save()
        except Call.DoesNotExist:
            raise Call.DoesNotExist
            print "There was an error in storing the recording..."

    rating = "Please rate your Wake Up Buddy Now! Press ONE to give your wake up buddy a thumbs up. Press TWO for a thumbs down. Press ZERO to report your wake up buddy! . ! . !"
    rating += "We're sorry, we didn't quite get that. Press ONE to give your wake up buddy a thumbs up. Press TWO for a thumbs down. Press ZERO to report your wake up buddy"
    goodbye = "We hope you had a great time! See you soon!"
    data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                        , 'goodbye' : goodbye
                                                        , 'rating' : rating
                                                        , 'ratingurl' : schedule
                                                    })

    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def fallbackRequest(request, confname):
    print "UNEXPECTED FALLBACK!"

    post = request.POST

    phone = post.get('To')
    errorURL = post.get('ErrorURL')
    errorCode = post.get('ErrorCode')

    # TODO HANDLE FALLBACK URL AND SAVE FALLBACK


    # Send async text message to admins to report error
    msg ="FALLBACK REQUEST!\n"
    if phone:
        print "Phone:", phone
        # Refresh Database Changes
        flush_transaction()
        profile = UserProfile.objects.get(phone=phone)
        msg += "User: " + profile.user.username + "\n"
        msg += "Phone: " + phone + "\n"
    if errorURL:
        print "ErrorURL:", errorURL
        msg += "ErrorCode:" + errorURL + "\n"
    if errorCode:
        print "ErrorCode:", errorCode
        msg += "URL: " + errorCode + "\n"
    send_async_mail("WUR Fallback", msg, "", ["447926925347@mmail.co.uk"], False)

    goodbye = "We are very sorry, something unexpected happened! This has been reported and will be handled immediately. Feel free to contact the Wake Up Roulette Team! We'd love to hear from you!"
    data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                        , 'goodbye' : goodbye
                                                    })
    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def processCallFeedback(request, conf):
    post = request.POST

    for var in post:
        print var, " : ", post[var]

    return HttpResponse()


def processSMS(request):
    fromresponse = request.GET.get("From", "")
    responsebody = request.GET.get("Body", "")

    if not fromresponse or not responsebody:
        return HttpResponse()

    reputation = 0
    if "good" in responsebody.lower(): reputation = 1
    elif "bad" in responsebody.lower(): reputation = -1
    else: return HttpResponse()

    phone = "0" + fromresponse[3:] if fromresponse.startswith("+44") else fromresponse

    user = User.objects.get(profile__phone=phone)
    otherUser = None

    currConf = Conferences.objects.filter( Q(caller1=user) | Q(caller2=user) )[0]

    if not currConf: return HttpResponse()

    if currConf.caller1 == user and not currConf.caller1done:
        currConf.caller1done = True
        otherUser = currConf.caller2
    elif currConf.caller2 == user and not currConf.caller2done:
        currConf.caller2done = True
        otherUser = currConf.caller1

    if not otherUser:
        return HttpResponse()

    otherUser.profile.reputation = otherUser.profile.reputation + reputation
    print otherUser.profile, reputation

    currConf.save()
    otherUser.profile.save()

    return HttpResponse()

def setAlarm(request):
    if request.method == 'POST':
        form = AlarmForm(request.POST)
        if form.is_valid():
            alarmon = request.POST.get('alarmon', False)
            alarm = form.cleaned_data['alarm']

            profile = request.user.profile
            profile.alarm = alarm
            profile.alarmon = alarmon
            profile.save()
            return render(request, 'alarm.html', {
                'name': 'Alarm set up successfully!'
            })
    else:
        form = AlarmForm()

    return render(request, 'alarm.html', {
        'form': form,
        'name': 'Set Up Alarm'
    })

class AlarmForm(forms.Form):
    alarm = forms.TimeField()
    alarmon = forms.CheckboxInput()



#
#from django.core.mail import send_mail
#import re
#import smtplib
#import dns.resolver
#from django.core.exceptions import ValidationError
#def get_valid_gateway(phone):
#    valid_gateway = ""
#
#    gateways = []
#    gateways.append("44" + phone + "@mmail.co.uk")      # O2
#    gateways.append("44" + phone + "@smtp-mbb.three.co.uk")      # 3
#    gateways.append("44" + phone + "@mms.ee.co.uk")     # EE
#    gateways.append("44" + phone + "@omail.net")        # Orange
#    gateways.append("44" + phone + "@orange.net")       # Orange
#    gateways.append("0" + phone + "@t-mobile.uk.net")   # T-Mobile
#    gateways.append("44" + phone + "@vodafone.net")     # Vodafone
#
#    for gate in gateways:
#        print "\n\ntesting gateway " + gate
#        hostname = gate.split('@')[-1]
#
#        try:
#            for server in [ str(r.exchange).rstrip('.') for r in dns.resolver.query(hostname, 'MX') ]:
#                try:
#                    print "creating smtp"
#                    smtp = smtplib.SMTP()
#                    print "creating connecition"
#                    smtp.connect(server)
#                    print "helo"
#                    status = smtp.helo()
#                    print "code 250? " + str(status[0])
#                    if status[0] != 250:
#                        continue
#                    print "checking mail"
#                    smtp.mail('')
#                    status = smtp.rcpt(gate)
#                    print "code 250? " + str(status[0])
#                    if status[0] != 250:
#                        raise ValidationError(_('Invalid email address.'))
#                    valid_gateway = gate # Valid Gateway found
#                    break
#                except smtplib.SMTPServerDisconnected:
#                    break
#                except smtplib.SMTPConnectError:
#                    continue
#        except dns.resolver.NXDOMAIN:
#            continue # Not valid
#        except dns.resolver.NoAnswer:
#            continue # Not valid
#
#    return gateways

def startRoulette(request):
    call_command('chronroulette')

    print "getting ready to test numbers"
#    print get_valid_gateway("7926925347")

    return render(request, 'start.html')

def survey(request):
    return render(request, 'survey.html')

def beta(request):
    return render(request, 'beta.html')

def notFound(request):
    return render(request, '404.html')
