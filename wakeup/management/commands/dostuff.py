from django.core.management.base import NoArgsCommand, make_option
from twilio.rest import TwilioRestClient
from accounts.models import UserProfile, Contact, MessageVerification
from datetime import datetime


from django.core.mail import send_mail as core_send_mail
from django.core.mail import EmailMultiAlternatives
import threading



class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current batch of wake-ups."

    option_list = NoArgsCommand.option_list + (
        make_option('--verbose', action='store_true'),
        )

    def handle_noargs(self, **options):

        print "doing stuff..."

        for u in UserProfile.objects.all():
            try:
                u.user.messageverification
            except MessageVerification.DoesNotExist:
                m = MessageVerification()
                m.user = u.user
                m.code = "1234"
                m.verified = True
                m.time_verified = datetime.now()
                m.save()


        print "Done doing stuff."
