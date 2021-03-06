from django.core.mail import EmailMultiAlternatives
from twilio.rest import TwilioRestClient
import threading
from wakeuproulette import settings
from pytz import timezone
from django.contrib.auth.models import User
import pytz
import datetime
import time


# Send emails asynchronously
class EmailThread(threading.Thread):
    def __init__(self, subject, body, from_email, recipient_list, fail_silently, html):
        self.subject = subject
        self.body = body
        self.recipient_list = recipient_list
        self.from_email = from_email
        self.fail_silently = fail_silently
        self.html = html
        threading.Thread.__init__(self)

    def run (self):
        msg = EmailMultiAlternatives(self.subject, self.body, self.from_email, self.recipient_list)
        if self.html:
            msg.attach_alternative(self.html, "text/html")
        msg.send(self.fail_silently)

def send_async_mail(subject, body, from_email, recipient_list, fail_silently=False, html=None, force=False, *args, **kwargs):
    if settings.PROD:

        if not force:
            recipients = []
            for email in recipient_list:
                try:
                    emailnotifications = User.objects.get(email=email).profile.emailnotifications
                    if  emailnotifications:
                        recipients.append(email)
                except:
                    pass
            recipient_list = recipients

        if recipient_list:
            EmailThread(subject, body, from_email, recipient_list, fail_silently, html).start()
    else: print "You're not in prod - you shouldn't be sending emails, if you wish to change it go to the toolbox and temporarily remove the flag"


# Call Settings Variables
dialingtimeout = 15
waitingtime = 20

# Twilio Settings
account = "AC0bcd0075fe2fac887342194ceb5bff95"
token = "1381268b52a1dcf44e60d88b3b2c6142"
client = TwilioRestClient(account, token)
fromnumber = "+441332650304"

# Variables for testing [Only for testing fallback url - error codes]
# TODO ADD ACCOUNT AND TOKEN
# account = ""
# token = ""
client = TwilioRestClient(account, token)
fromnumber = "+15005550006"

# Make API calls asynchronously
class CallThread(threading.Thread):
    def __init__(self, phone, confurl, fallbackurl, noanswerurl, silent=False, wait=0):
        self.phone = phone
        self.confurl = confurl
        self.fallbackurl = fallbackurl
        self.noanswerurl = noanswerurl
        self.silent = silent
        self.wait = wait
        threading.Thread.__init__(self)

    def run (self):

        if self.wait: time.sleep(self.wait)

        call = client.calls.create(
              url=self.confurl
            , to = self.phone
            , from_ = fromnumber
            , timeout = dialingtimeout
            , fallback_method = 'Post'
            , fallback_url=self.fallbackurl
            , if_machine = 'Hangup'
            , status_callback = self.noanswerurl
            , status_method = 'Post'
            , record=False)

        if not self.silent:
            print "Called " + self.phone

def call_async(phone, confurl, fallbackurl, noanswerurl, silent=False, wait=0):
    CallThread(phone, confurl, fallbackurl, noanswerurl, wait=wait).start()

class SmsThread(threading.Thread):
    def __init__(self, phone, message):
        self.phone = phone
        self.message = message
        threading.Thread.__init__(self)

    def run (self):
        sms = client.sms.messages.create(body=self.message,
                                         to=self.phone,
                                         from_=fromnumber)
        print "Messaged verification code " + self.phone

def sms_async(phone, message):
    try:
        SmsThread(phone, message).start()
    except Exception, err:
        send_async_mail("Error Phone Verification", "There was an attempt to verify the number " + phone + " but it failed. Err: " + str(err), "wakeuproulette@gmail.com", zip(*settings.ADMINS)[1])


def local_date(date, request):
    tz = request.session.get("user_timezone", pytz.utc)
    utc_dt = date
    return utc_dt.astimezone(tz)


def local_time(time, request):
    tz = request.session.get("user_timezone", pytz.utc)
    server_tz = pytz.timezone('Europe/London')
    utc_dt = datetime.datetime(2012, 11, 27, time.hour, time.minute, time.second, tzinfo=server_tz)
    loc_dt = utc_dt.astimezone(tz)
    return datetime.time(loc_dt.hour, loc_dt.minute, loc_dt.second)

def global_time(time, request):
    tz = request.session.get("user_timezone", pytz.utc)
    loc_dt = datetime.datetime(2012, 11, 27, time.hour, time.minute, time.second)
    loc_dt= tz.localize(loc_dt, is_dst=None)
    server_tz = pytz.timezone('Europe/London')
    utc_dt = loc_dt.astimezone(server_tz)
    return datetime.time(utc_dt.hour, utc_dt.minute, utc_dt.second)

