from django.core.management.base import NoArgsCommand, make_option
from twilio.rest import TwilioRestClient
from accounts.models import UserProfile


from django.core.mail import send_mail as core_send_mail
from django.core.mail import EmailMultiAlternatives
import threading



class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current batch of wake-ups."

    option_list = NoArgsCommand.option_list + (
        make_option('--verbose', action='store_true'),
        )

    def handle_noargs(self, **options):

        print "Ok, now its gonna start"
        msg = "It works"
        send_mail("WUR Fallback", msg, "", ["447926925347@mmail.co.uk"], False)
        print "doesn't seem that async to me..."