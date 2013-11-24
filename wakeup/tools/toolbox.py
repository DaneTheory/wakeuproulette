from django.core.mail import EmailMultiAlternatives
from twilio.rest import TwilioRestClient
import threading


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

def send_async_mail(subject, body, from_email, recipient_list, fail_silently=False, html=None, *args, **kwargs):
    EmailThread(subject, body, from_email, recipient_list, fail_silently, html).start()


# Call Settings Variables
dialingtimeout = 15
waitingtime = 20

# Twilio Settings
account = "AC8f68f68ffac59fd5afc1a3317b1ffdf8"
token = "5a556d4a9acf96753850c39111646ca4"
client = TwilioRestClient(account, token)
fromnumber = "+441279702159"

# Variables for testing [Only for testing fallback url - error codes]
#account = "AC8698b1cf15def42651825fc466513ef4"
#token = "2d778c2946ebd9c7fcb96a985660c179"
#client = TwilioRestClient(account, token)
#fromnumber = "+15005550006"

# Make API calls asynchronously
class CallThread(threading.Thread):
    def __init__(self, phone, confurl, fallbackurl, noanswerurl):
        self.phone = phone
        self.confurl = confurl
        self.fallbackurl = fallbackurl
        self.noanswerurl = noanswerurl
        threading.Thread.__init__(self)

    def run (self):
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
            , record=True)
        print "Called " + self.phone

def call_async(phone, confurl, fallbackurl, noanswerurl):
    CallThread(phone, confurl, fallbackurl, noanswerurl).start()

