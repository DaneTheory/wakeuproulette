from django.shortcuts import render
from django.shortcuts import render_to_response
from django import forms
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth.models import User
from models import Conferences
from django.core.management import call_command
from django.utils.translation import ugettext as _
from accounts.models import UserProfile
from django.db import transaction
from twilio.rest import TwilioRestClient
from django.conf import settings
from datetime import datetime


# Global Variables
CALL_LIMIT = 10
WELCOME_LIMIT = 5
HOLD_LIMIT = 10
TIMEOUT = 15
RE_DIAL_LIMIT = 3
CONFERENCE_SCHEDULE_DELIMITER = ':'


@transaction.commit_manually
def flush_transaction():
    transaction.commit()


def home(request):
    return render(request, 'index.html')

def find_match(profile):
    print "Finding match for: ", profile
    # Refresh Database Changes
    flush_transaction()
    allmatches = UserProfile.objects.filter(alarmon=False, active=True, booked=False).exclude(gender=profile.gender)
    print "Matches found are: ", allmatches

    if allmatches:
        return allmatches.order_by('?')[0]
    else:
        return None

def get_active_conference_for(profile, schedule):
    scheduleparts = schedule.split(CONFERENCE_SCHEDULE_DELIMITER)
    now = datetime.now()
    laterthan = now.replace(hour=int(scheduleparts[0]),minute=int(scheduleparts[1]),second=0,microsecond=0)
    # Refresh Database Changes
    flush_transaction()
    try:
        found = Conferences.objects.get(Q(datecreated__gt=laterthan), Q(caller1=profile) | Q(caller2=profile))
        print "CONFERENCE FOUND\n#####\n#####\n",found.conferencename,"\n#####\n#####"
#        return Conferences.objects.filter(datecreated__lt=laterthan).get(Q(caller1=profile) | Q(caller2=profile))
        return found
    except Conferences.DoesNotExist:
        return None


def send_to_waiting_room(timelimit, schedule, say):
    return render_to_response("twilioresponse.xml", { 'say' :say
                                                    , 'confname' : schedule
                                                    , 'timelimit' : timelimit
                                                    , 'link' : True
                                                    , 'record' : False
                                                    , 'beep' : False})

@transaction.commit_on_success
def match_or_send_to_waiting_room(profile, schedule):

##    Person has reached his waiting limit, hang up
#    if person.waiting > waitinglimit:
#        profile.active = False
#        profile.save()
#        say = "We are very sorry - we couldn't find you any matches, we hope that tomorrow you meet an awesome person! Good bye!"
#        data = render_to_response("twilioresponse.xml", {'say' :say, 'hangup' : True})

    if profile.booked:
        conf = get_active_conference_for(profile, schedule)
        if conf:
            confname = conf.conferencename
            other = None
            if conf.caller1 == profile:
                other = conf.caller2.profile
            else:
                other = conf.caller1.profile

            # Check if the other person hasn't hung up
            if other.active:
                say = "We have found you a match! You are now connected with " + other.user.username
                aftersay = "We hope you enjoyed your conversation! Don't forget to rate your Wake Up Buddy at wakeuproulette.com! See you tomorrow!"
                return render_to_response("twilioresponse.xml", {     'say' :say
                                                                    , 'confname' : conf.conferencename
                                                                    , 'timelimit' : CALL_LIMIT
                                                                    , 'hangup' : True
                                                                    , 'aftersay' : aftersay
                                                                    , 'record' : True
                                                                    , 'beep' : True
                                                                })

            # If we are here it's because the other person hung up - delete the conference room and send to waiting room
            conf.delete()

        profile.booked = False
        profile.save()


    match = find_match(profile)
    if match:
        conf = Conferences()
        conf.conferencename = profile.user.username + "-" + match.user.username + "-" + schedule
        conf.caller1 = profile.user
        conf.caller2 = match.user
        conf.save()

        profile.booked = True
        match.booked = True
        profile.save()
        match.save()

        say = "We have found you a match! You are now connected with " + match.user.username
        aftersay = "We hope you enjoyed your conversation! Don't forget to rate your Wake Up Buddy at wakeuproulette.com! See you tomorrow!"
        return render_to_response("twilioresponse.xml", {     'say' :say
                                                            , 'confname' : conf.conferencename
                                                            , 'timelimit' : CALL_LIMIT
                                                            , 'hangup' : True
                                                            , 'aftersay' : aftersay
                                                            , 'record' : True
                                                            , 'beep' : True
                                                        })
    else:
        return send_to_waiting_room(HOLD_LIMIT, confname, "Please bare with us - we'll find the best match for you!")

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


    # Refresh Database Changes
    flush_transaction()
    phone = post['To']
    profile = UserProfile.objects.get(phone=phone)

    if 'AnsweredBy' in post and post['AnsweredBy'] == 'human' and post['CallStatus'] == 'in-progress':
        data = None

        if 'RecordingUrl' in post:
            print "CALL IS SUPPOSED TO BE TERMINATED - CHECK WHAT'S UP"
            for var in post:
                print var, post[var]
            print '\n'


        # If user is currently waiting
        if 'DialCallStatus' in post and post['DialCallStatus'] == 'answered':
            print "Person is still awake, and he's still waiting!"
            data = match_or_send_to_waiting_room(profile, schedule)

        # Else, person has just woken up
        else:
            print "Person has just waken up and answered!"

            profile.alarmon = False
            profile.save()

            data = send_to_waiting_room(WELCOME_LIMIT, schedule, "Welcome to Wake Up Roulette! We'll find you an awesome person! On the meantime, why don't you relax in the waiting room? Smiley Face. L O L")

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
    profile = UserProfile.objects.get(phone=phone)

    print "Handling ANSWER CALLBACK request"
    print "CallStatus: ", post['CallStatus']
    print "Phone: ", post['To']
    if 'AnsweredBy' in post: print "AnsweredBy: ", post['AnsweredBy']
    if 'DialCallStatus' in post: print "DialCallStatus: ", post['DialCallStatus']
    if 'RecordingUrl' in post:
        print "Recoding URL: ", post['RecordingUrl']
        print "Recording Duration: ", post['RecordingDuration']

    # If dude didn't answer, call him again
    if post['CallStatus'] == 'no-answer':
        # Make sure that number of re-dials has not been exceeded
        if profile.redials >= RE_DIAL_LIMIT:
            data = render_to_response("twilioresponse.xml")

            # Re-setting redial count
            profile.redials = 0
            profile.save()
        else:
            # TODO: THIS SHOULD REALLY BE DEALT WITH A SIMPLE XMLRESPONSE RATHER THAN API CALL
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

            profile.redials = profile.redials + 1
            profile.save()

    elif post['CallStatus'] == 'completed' and post['AnsweredBy'] == 'human':
        print "Call has been completed!"
        print "Conference Room", schedule
        print '\n'

        profile.alarmon = False
        profile.active = False
        profile.booked = False
        profile.save()

        # Check for recording
        if 'RecordingUrl' in post:
            conf = get_active_conference_for(profile, schedule)

            rURL = post['RecordingUrl']
            rDuration = post['RecordingDuration']

            # If the conference is full, the call has been recorded, AND the new recording is less than the current
            if (conf.caller1 and conf.caller2) and (not conf.recordingduration or rDuration < conf.recordingduration):
                conf.recordingurl = rURL
                conf.recordingduration = rDuration

            conf.save()

        data = render_to_response("twilioresponse.xml")


    else:
        print "Something unexpected happened! Check what was it:"
        for var in post:
            print var, post[var]
        print '\n'
        data = render_to_response("twilioresponse.xml")

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
