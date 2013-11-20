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


def home(request):
    return render(request, 'index.html')

@csrf_exempt
def serveConference(request, confname):
    post = request.POST

    print "Handling request"
    print "CallStatus: ", post['CallStatus']
    print "Phone: ", post['To']
    if 'AnsweredBy' in post: print "AnsweredBy: ", post['AnsweredBy']
    if 'DialCallStatus' in post: print "DialCallStatus: ", post['DialCallStatus']
    if 'RecordingUrl' in post:
        print "Recoding URL: ", post['RecordingUrl']
        print "Recording Duration: ", post['RecordingDuration']



    if 'AnsweredBy' in post and post['AnsweredBy'] == 'human' and post['CallStatus'] == 'in-progress':

        data = None

        # Check if the conversation is already timed-out
        if 'DialCallStatus' in post and post['DialCallStatus'] == 'answered':
            print "Call has reached the time limit! Hanging up now!"
            phone = post['To']
            profile = UserProfile.objects.get(phone=phone)
            profile.active = False
            profile.save()

            say = "We hope you enjoyed the conversation! Make sure you rate your wake up buddy at wakeuproulette.com!"
            data = render_to_response("twilioresponse.xml", {'hangup':True, 'say':say})

        else:
            print "Call has been answered!"

            phone = post['To']
            profile = UserProfile.objects.get(phone=phone)
            profile.alarmon = False
            profile.save()
            print "Profile: ", profile

            try:
                print "Getting Conference Room: ", confname
                conf = Conferences.objects.get(conferencename=confname)
                print "Conference room found!"
            except Conferences.DoesNotExist:
                print "Conference room not found, creating a new conference room"
                conf = Conferences(conferencename=confname)

            if not conf.caller1:
                print "Saving caller1 as: ", profile
                conf.caller1 = profile.user
            else:
                print "Caller 1 already there: ", conf.caller1.profile
                print "Saving Caller 2 as: ", profile
                conf.caller2 = profile.user

            conf.save()

            say = "Welcome to Wake Up Roulette! We will now connect you with an awesome person!"
            data = render_to_response("twilioresponse.xml", {'confname' : confname, 'say' : say})

        print '\n'
        return HttpResponse(data, mimetype="application/xml")


    elif post['CallStatus'] == 'completed' and post['AnsweredBy'] == 'human':
        print "Call has been completed!"
        print "Conference Room", confname
        print '\n'

        phone = post['To']
        user = UserProfile.objects.get(phone=phone)
        user.alarmon = False
        user.active = False
        user.save()

        # Check for recording
        if 'RecordingUrl' in post:
            conf = None
            try:
                conf = Conferences.objects.get(conferencename=confname)

                rURL = post['RecordingUrl']
                rDuration = post['RecordingDuration']

                # If the conference is full, the call has been recorded, AND the new recording is less than the current
                if (conf.caller1 and conf.caller2) and (not conf.recordingduration or rDuration < conf.recordingduration):
                    conf.recordingurl = rURL
                    conf.recordingduration = rDuration

                    conf.save()

            except Conferences.DoesNotExist:
                print "Something is wrong! Check why the conference is not being created!"


        data = render_to_response("twilioresponse.xml")
        return HttpResponse(data, mimetype="application/xml")

    print "Something else happened! Check what was it:"
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
