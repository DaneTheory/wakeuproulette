from django.core.management.base import NoArgsCommand, make_option
from twilio.rest import TwilioRestClient
from accounts.models import UserProfile, Contact


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
            if u.gender == 'F':
                u.malematch = True
            else:
                u.femalematch = True
            u.save()

        print "Done doing stuff."
