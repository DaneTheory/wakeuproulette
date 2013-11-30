from django.shortcuts import render
from django.shortcuts import render_to_response
from django import forms
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth.models import User
from models import Conference, Call, Recording
from django.core.management import call_command
from django.db import transaction
from twilio.rest import TwilioRestClient
from django.conf import settings
from datetime import datetime
from accounts.models import UserProfile

from wakeup.tools.toolbox import send_async_mail, call_async


# Global Variables
CALL_LIMIT = 20
WELCOME_LIMIT = 5
HOLD_LIMIT = 10
TIMEOUT = 15

WAITING_ROOM_MAX = 5

RE_DIAL_LIMIT = 1
REDIRECT_LIMIT = 1

CONFERENCE_SCHEDULE_DELIMITER = ':'

# Rating given to users that are reported
USER_REPORT_RATING = -5


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
    allmatches = Call.objects.filter(datecreated=as_date(schedule), answered=True, matched=False, completed=False).exclude(user=call.user)

    # Gender matching
    any_match_q = Q(user__profile__any_match=True)
    male_match_q = Q(user__profile__malematch=True)
    female_match_q = Q(user__profile__femalematch=True)
    if not call.user.profile.any_match:
        if call.user.profile.malematch == True and call.user.profile.femalematch == False:
            allmatches = allmatches.filter(user__profile__gender='M')
        elif call.user.profile.malematch == False and call.user.profile.femalematch == True:
            allmatches = allmatches.filter(user__profile__gender='F')
    if call.user.profile.gender == 'M':
        allmatches = allmatches.filter(any_match_q | male_match_q)
    else:
        allmatches = allmatches.filter(any_match_q | female_match_q)

    # Ordering
    allmatches = allmatches.order_by('?')

    print "Matches found are: ", allmatches

    if allmatches:
        return allmatches[0]
    else:
        return None


def get_call_or_none(schedule, phone):
    try:
        return Call.objects.filter(datecreated=as_date(schedule)).get(user__profile__phone=phone)

    # Catch Exeption caused for a call not existing and return None
    except Exception:
        return None

def get_active_waiting_room(schedule):
    dateSchedule = as_date(schedule)
    # Refreshing database
    flush_transaction()
    try:
        allWaitingRooms = Conference.objects.filter(datecreated=dateSchedule, maxcapacity=WAITING_ROOM_MAX)
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


def send_to_conference_room(call, schedule, match):

    # Check if the match is still on the phone - if not, mark match as not completed and try to find him a match
    flush_transaction()
    match.reload()
    if match.completed:
        call.matched = False
        call.save()
        return None

    say = "We have found you a match! You are now connected with " + match.user.username + "! Press Star if you wish to end the conversation immediately and rate your wake up buddy."
    return render_to_response("twilioresponse.xml", {     'say' :say
                                                        , 'confname' : call.conference.pk
                                                        , 'timelimit' : CALL_LIMIT
                                                        , 'finishrequest' : schedule
                                                        , 'hanguponstar' : True
                                                        , 'record' : call.user.profile.recording
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

# TODO Ensure mutually exclusive transactions - once there was a deadlock, idk why
# This method needs to be atomic
@transaction.commit_on_success
def match_or_send_to_waiting_room(call, schedule):

    # Refreshing database object
    flush_transaction()
    call.reload()

    if call.matched:
        other = call.conference.call_set.exclude(pk=call.pk)[0]
        data = send_to_conference_room(call, schedule, other)

        if data: return data


    matchcall = find_match(schedule, call)
    if matchcall:
        conf = Conference()
        conf.maxcapacity = 2
        conf.datecreated = as_date(schedule)
        conf.save()

        call.conference = conf
        call.matched = True
        call.save()

        matchcall.conference = conf
        matchcall.matched = True
        matchcall.save()

        data = send_to_conference_room(call, schedule, matchcall)
        if data: return data

    if call.user.profile.any_match:
        call.user.profile.any_match = False
        call.user.profile.save()

        return render_to_response("twilioresponse.xml", { 'say' :"We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day! Good bye!",
                                                          'hangup' : True })
    #Check if we have exceeded the waiting redirect limits
    elif call.retries > REDIRECT_LIMIT:
        # The user has reached the limit of redials, so hang up
        print "WAITING LIMIT DONE - TRY TO MATCH WITH ANY PERSON"
        any_match = "We could not find any matches. If you'd like us to try to match you with Anyone please press any number now."
        goodbye = "We wish you an Amazing day! Good bye!"
        return render_to_response("twilioresponse.xml", { 'any_match' :any_match, 'schedule': schedule, 'hangup': True, 'goodbye' : goodbye })

    call.retries = call.retries + 1
    call.save()

    # Send user to private conference (Conferencename=Username) or send them to the waiting room they were at
    return send_to_waiting_room(  HOLD_LIMIT
                                    , schedule
                                    , call.user.username if call.user.profile.roomdesired else call.conference.pk
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
    call = get_call_or_none(schedule, phone)

    # Check that call has been created
    if not call:
        # TODO Report error, as call should exist - For now we'll just hang up on him - we need logging!
        print "Call Should exist"

        say = "We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day! Good bye!"
        data = render_to_response("twilioresponse.xml", { 'say' :say, 'hangup' : True })

    elif 'AnsweredBy' in post and post['AnsweredBy'] == 'human' and post['CallStatus'] == 'in-progress':
        data = None

        # If user is currently waiting
        if 'DialCallStatus' in post and post['DialCallStatus'] == 'answered':
            print "Person is still awake, and he's still waiting!"

            print "FINDING MATCH"
            data = match_or_send_to_waiting_room(call, schedule)

        # Else, person has just woken up
        else:
            print "Person has just waken up and answered!"

            waiting = get_active_waiting_room(schedule)

            # Setting the redials to zero - we'll use this count to limit the waiting time
            call.retries = 0
            call.matched = False
            call.conference = waiting
            call.answered = True
            call.save()

            # Mark user as awake so he doesn't get any more snoozes
            call.user.profile.alarmon = False
            call.user.profile.save()

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
    phone = post.get('To')


    print "####### SCHEDULE #####   ", schedule
    print "Handling ANSWER CALLBACK request"
    print "CallStatus: ", post['CallStatus']
    print "Phone: ", post['To']
    if 'CallDuration' in post: print 'CallDuration', post['CallDuration']
    if 'AnsweredBy' in post: print "AnsweredBy: ", post['AnsweredBy']
    if 'DialCallStatus' in post: print "DialCallStatus: ", post['DialCallStatus']
    if 'RecordingUrl' in post:
        print "Recoding URL: ", post['RecordingUrl']
        print "Recording Duration: ", post['RecordingDuration']


    # Refresh Database Changes
    flush_transaction()
    call = get_call_or_none(schedule, phone)

    if not call:
        # TODO As above, we need to log this somehow to report it
        print "Call is not found - this error should be logged"
        data = render_to_response("twilioresponse.xml")

    # Call has been completed
    elif post['CallStatus'] == 'completed' and post['AnsweredBy'] == 'human':
        print "Call has been completed!"
        print "Conference Room", schedule

        # Resetting all wakeup flags
        call.retries = 0
        call.completed = True
        if 'CallDuration' in post: call.callduration = post['CallDuration']
        call.save()

        if call.conference:
            conf = call.conference.call_set

            print "Call set:", conf
        else:
            print "NO CONFERENCE!"

        data = render_to_response("twilioresponse.xml")

    # This is the case when post['CallStatus'] == 'no-answer' or post['CallStatus'] == 'busy' or post['CallStatus'] == 'failed' or post['AnsweredBy'] == 'machine'
    elif not call.answered:
        # Make sure that number of re-dials has not been exceeded
        if call.retries >= RE_DIAL_LIMIT:
            print "LIMIT REDIALS. HANGING UP..."
            data = render_to_response("twilioresponse.xml")

            # Check the call status - if it says failed, it is most probably because the phone number doesn't exist or there is no signal
            if post['CallStatus'] == 'failed':
                # TODO Report in log

                call.errorcode = "cfail"

                print "Call Failed! Reporting. Phone: ", phone
                msg = "CallStatus: Failed\n"
                msg += "Phone: " + phone + "\n"
                msg += "Probably Number Doesn't Exist"

                send_async_mail("WUR Fallback", msg, "wakeuproulette@gmail.com", zip(*settings.ADMINS)[1], True)
                data = render_to_response("twilioresponse.xml")

            # Re-setting redial count
            call.retries = 0
            call.completed = True
            call.save()

        elif not call.answered:
            print "REDIALING...."

            confurl = settings.WEB_ROOT + 'wakeuprequest/' + schedule
            noanswerurl = settings.WEB_ROOT + 'answercallback/' + schedule
            fallbackurl = settings.WEB_ROOT + 'fallback/' + schedule

            print "No answer, calling again: ", phone, confurl
            call_async(phone, confurl, fallbackurl, noanswerurl)

            call.retries = call.retries + 1
            call.save()

        data = render_to_response("twilioresponse.xml")

    # This else means that the user has answered already and there is no reason to call again
    else:
        print "User was called when he already answered - check status:"
        print "Call:", call, "Answered:", call.answered
        print "Post:", post

    print '\n'
    return HttpResponse(data, mimetype="application/xml")


@csrf_exempt
def tryAnyMatch(request, schedule):
    print "ANY MATCH REQUEST!"

    schedule = schedule.replace("/", "")
    post = request.POST
    phone = post['To']
    flush_transaction()
    call = get_call_or_none(schedule, phone)
    call.user.profile.any_match = True
    call.user.profile.save()
    call.retries = 0
    call.save()
    data = send_to_waiting_room(  HOLD_LIMIT
                                , schedule
                                , call.user.username if call.user.profile.roomdesired else call.conference.pk
                                , False
                                , "We'll try to find you an awesome person!")
    return HttpResponse(data, mimetype="application/xml")



@csrf_exempt
def sendToPrivateRoom(request, schedule):
    print "PRIVATE ROOM REQUEST!"
    post = request.POST

    phone = post['To']

    # Refresh Database Changes
    flush_transaction()
    call = get_call_or_none(schedule, phone)


    if not call:
        # TODO Report error, as call should exist - For now we'll just hang up on him - we need logging!
        print "Call Should exist"

        say = "We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day! Good bye!"
        data = render_to_response("twilioresponse.xml", { 'say' :say, 'hangup' : True })

    # Call has been matched, so just send him to the waiting room - when he comes back, he'll be set up with his other caller
    if call.matched:
        data = send_to_waiting_room(  HOLD_LIMIT
            , schedule
            , call.user.username
            , False
            , "We'll send you to a private room while we connect you with an awesome person!")

    else:
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

    # Refresh Database Changes
    flush_transaction()
    phone = post['To']

    call = get_call_or_none(schedule,phone)

    goodbye = "Thank you for your rating! We hope you had a great time! See you soon!"
    rating = ""
    gatherurl = ""

    try:
        othercall = call.conference.call_set.exclude(pk=call.pk)[0]

        digit = post['Digits']

        # Request contact
        if digit == '1':
            print "CONTACT REQUEST!"
            call.user.profile.request_contact(othercall.user)
        # Thumbs up:
        if digit == '1' or digit == '2':
            print "+1 reputation to", othercall.user.username
            othercall.user.profile.reputation = othercall.user.profile.reputation + 1
            othercall.user.profile.save()

            call.rated = True
            call.save()

            othercall.rating = 1
            othercall.save()
        # Thumbs down:
        elif digit == '3':
            print "-1 reputation to", othercall.user.username
            othercall.user.profile.reputation = othercall.user.profile.reputation - 1
            othercall.user.profile.save()

            call.rated = True
            call.save()

            othercall.rating = -1
            othercall.save()
        # Reported
        elif digit == '0':
            # TODO HANDLE REPORTING
            goodbye =  othercall.user.username + " has been reported. We apologize in behalf of your wake up buddy! Please contact the Wake Up Roulette Team if you need anything! We'd love to hear from you!"
            othercall.user.profile.reputation = othercall.user.profile.reputation + USER_REPORT_RATING
            othercall.user.profile.save()

            othercall.rating = USER_REPORT_RATING
            othercall.save()

            call.rated = True
            call.save()

            msg = "User: " + call.user.username + "\r\n"
            msg += "Reported: " + othercall.user.username + "\r\n"
            msg += "Schedule: " + schedule + "\r\n"

            # Reporting to admins
            send_async_mail("USER REPORTED",msg, "hackasoton@gmail.com", zip(*settings.ADMINS)[1], True)
        else:
            # TODO HANDLE WRONG TYPING - Use user retries for this
            print "Incorrect number, user pressed" , digit
            gatherurl = schedule
            rating = "We're sorry, we didn't get that! Please press ONE to give him a thumbs up. Press TWO to give him a thumbs down. Press ZERO to report your wake up buddy."

        data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                            , 'rating' : rating
                                                            , 'ratingurl' : gatherurl
                                                            , 'goodbye' : goodbye
                                                        })
    # TODO Exceptions caught include a digit not found in POST, as well as Call not found, but reporting could be included, and it shoudl be handled somehow when Call doesn't exist
    except Exception:
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
    phone = post.get('To')
    rURL = post.get('RecordingUrl')
    rDuration = post.get('RecordingDuration')

    print "Phone:", phone
    print "RecordingURL:",rURL
    print "Duration:", rDuration

    call = get_call_or_none(schedule, phone)

    if not call:
        # TODO: Report and Log
        print "There was an error in storing the recording..."

    else:
        # TODO: Test this
        # For info on how Recording privacy is handled check out https://docs.google.com/document/d/1LkKosw9-EMtIkx9Y5f0AxTAA418KHbJ2eTWbPOGrgoc/edit
#            try:
        # If other caller doesn't exist, throw Exeption and don't store Recording object
        callOther = call.conference.call_set.exclude(pk=call.pk)[0]


        # Check for recording
        if not rURL or not rDuration:
            # TODO Handle this error, as this it twilio error [Log]
            print "No recording in Twilio POST!"


        # Create the recording
        recording = Recording()
        recording.recordingurl = rURL
        recording.recordingduration = rDuration
        recording.datecreated = as_date(schedule)
        recording.call = call
        recording.save()

        # Check if the callers are contacts and initialize the recording as shared as required
        if call.user.profile.is_contact(callOther.user):
            recording.shared = True
        else:
            recording.shared = False

        # If the other Recording has been created, then
        try:
            recording.other = callOther.recording

            # Check if the other recording was created but wasn't initialized with a Recording (Twilio Error)
            if not callOther.recording.recordingurl:
                # TODO Handle this error, as this it twilio error [Log]
                print "No recording in the other recording object!"
                callOther.recording.recordingurl = rURL
                callOther.recording.recordingduration = rDuration

            # If Shared, select as chosen if the other recording does not have a recordingurl or if the duration is less
            if recording.shared  and ( not callOther.recording.recordingurl or recording.recordingduration <= callOther.recording.recordingduration ):
                callOther.recording.chosen = False
                recording.chosen = True

        except Recording.DoesNotExist:
            if recording.shared:
                recording.chosen = True


        recording.save()

#            except Exception:
#                print "Other call does not exist yet"


    rating = "Please rate your Wake Up Buddy Now! Press ONE to connect with and give your wake up buddy a thumbs up. Press TWO for just a thumbs up. Press THREE for thumbs down. Press ZERO to report your wake up buddy! . ! . !"
    rating += "We're sorry, we didn't quite get that. Press ONE to connect with and give your wake up buddy a thumbs up. Press TWO for just a thumbs up. Press THREE for thumbs down. Press ZERO to report your wake up buddy"
    goodbye = "We hope you had a great time! See you soon!"
    data = render_to_response("twilioresponse.xml", {     'hangup' : True
                                                        , 'goodbye' : goodbye
                                                        , 'rating' : rating
                                                        , 'ratingurl' : schedule
                                                    })

    return HttpResponse(data, mimetype="application/xml")

@csrf_exempt
def fallbackRequest(request, schedule):
    print "UNEXPECTED FALLBACK!"

    post = request.POST

    phone = post.get('To')
    errorURL = post.get('ErrorURL')
    errorCode = post.get('ErrorCode')

    # Send async text message to admins to report error
    msg = ""
    if phone:
        print "Phone:", phone
        msg += "Phone: " + phone + "\n"
        # Save error in call

        # Refresh Database Changes
        flush_transaction()
        call = get_call_or_none(schedule, phone)
        if call:
            call.completed = True
            if errorCode: call.errorcode = errorCode
            else: call.errorCode = '00000'
            msg += "User: " + call.user.username + "\n"
            call.save()
        else:
            print "Call not found"
            msg += "Call Not Found\n"
    if errorURL:
        print "ErrorURL:", errorURL
        msg += "ErrorURL:" + errorURL + "\n"
    if errorCode:
        print "ErrorCode:", errorCode
        msg += "ErrorCode: " + errorCode + "\n"
#    send_async_mail("WUR Fallback", msg, "", zip(*settings.ADMINS)[1], True)

    # Error Code means HTTP Failure, or no response - this could be due to a transaction deadlock, or just bad traffic - just try again
#    if errorCode == '11205':
#        # TODO  This is repeated code, maybe create a function form the code that sends the person to the waiting room
#        #Check if we have exceeded the waiting redirect limits
#        if call.retries > REDIRECT_LIMIT:
#            # The user has reached the limit of redials, so hang up
#            print "WAITING LIMIT DONE - HANGING UP NAO"
#            say = "We are very sorry - We could not find you a match today, but tomorrow we'll do our best to compensate it! We wish you an awesome day! Good bye!"
#            data = render_to_response("twilioresponse.xml", { 'say' :say, 'hangup' : True })
#        else:
#            print "FINDING MATCH"
#            call.retries = call.retries + 1
#            call.save()
#            data = match_or_send_to_waiting_room(call, schedule)
#    else:
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
