from django.shortcuts import render
from django.shortcuts import render_to_response
from django import forms
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth.models import User
from models import Conferences
from django.core.management import call_command


def home(request):
    return render(request, 'index.html')

@csrf_exempt
def serveConference(request, confname):
    data = render_to_response("twilioresponse.xml", {'confname':confname})

    return HttpResponse(data, mimetype="application/xml")

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
            switch = request.POST.get('switch', False)
            alarm = form.cleaned_data['alarm'] if switch else None

            profile = request.user.profile
            profile.alarm = alarm
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
    switch = forms.CheckboxInput()

from django.core.mail import send_mail
import re
import smtplib
import dns.resolver
from django.core.exceptions import ValidationError
def get_valid_gateway(phone):
    valid_gateway = ""

    gateways = []
    gateways.append("44" + phone + "@mmail.co.uk")      # O2
    gateways.append("44" + phone + "@three.co.uk")      # 3
    gateways.append("44" + phone + "@mms.ee.co.uk")     # EE
    gateways.append("44" + phone + "@omail.net")        # Orange
    gateways.append("44" + phone + "@orange.net")       # Orange
    gateways.append("0" + phone + "@t-mobile.uk.net")   # T-Mobile
    gateways.append("44" + phone + "@vodafone.net")     # Vodafone

    for gate in gateways:
        print "\n\ntesting gateway " + gate
        hostname = gate.split('@')[-1]

        try:
            for server in [ str(r.exchange).rstrip('.') for r in dns.resolver.query(hostname, 'MX') ]:
                try:
                    print "creating smtp"
                    smtp = smtplib.SMTP()
                    print "creating connecition"
                    smtp.connect(server)
                    print "helo"
                    status = smtp.helo()
                    print "code 250? " + str(status[0])
                    if status[0] != 250:
                        continue
                    print "checking mail"
                    smtp.mail('')
                    status = smtp.rcpt(gate)
                    print "code 250? " + str(status[0])
                    if status[0] != 250:
                        raise ValidationError(_('Invalid email address.'))
                    valid_gateway = gate # Valid Gateway found
                    break
                except smtplib.SMTPServerDisconnected:
                    break
                except smtplib.SMTPConnectError:
                    continue
        except dns.resolver.NXDOMAIN:
            continue # Not valid
        except dns.resolver.NoAnswer:
            continue # Not valid

    return gateways

def startRoulette(request):
#    call_command('chronroulette')

    print "getting ready to test numbers"
    print get_valid_gateway("7926925347")

    return render(request, 'start.html')

def newsletter(request):
    return render(request, 'newsletter.html')

def notFound(request):
    return render(request, '404.html')
