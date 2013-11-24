from django.core.management.base import NoArgsCommand, make_option
from accounts.models import UserProfile
from datetime import datetime, timedelta
from twilio.rest import TwilioRestClient
from wakeup.models import Call
import time
from django.conf import settings
from django.db import transaction
import random


# Settings Variables
dialingtimeout = 15
maxTries = 3
waitingtime = 20


# Global Variables
account = "AC8f68f68ffac59fd5afc1a3317b1ffdf8"
token = "5a556d4a9acf96753850c39111646ca4"
client = TwilioRestClient(account, token)
fromnumber = "+441279702159"

# Variables for testing
#account = "AC8698b1cf15def42651825fc466513ef4"
#token = "2d778c2946ebd9c7fcb96a985660c179"
#client = TwilioRestClient(account, token)
#fromnumber = "+15005550006"


@transaction.commit_manually
def flush_transaction():
    transaction.commit()


class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current batch of wake-ups."

    option_list = NoArgsCommand.option_list + (
        make_option('--verbose', action='store_true'),
        )

    def handle_noargs(self, **options):

        schedule = datetime.now()
        schedule.replace(microsecond=0)
        confname = str(schedule.strftime("%d:%m:%y:%H:%M:%S"))
        confurl = settings.WEB_ROOT + "wakeuprequest/" + confname
        noanswerurl = settings.WEB_ROOT + 'answercallback/' + confname
        fallbackurl = settings.WEB_ROOT + 'fallback/' + confname

        self.stdout.write("Wake Up Chron Roulette Started - " + str(schedule), ending='\n\n')

        towakeup = UserProfile.objects.filter(alarmon=True)

        # Creating all call objects
        for u in towakeup:
            c = Call()
            c.user = u.user
            c.datecreated = schedule
            c.save()


        tries = 0
        # Iterate until we don't have any more people we need to wake up, or our tries have ran out
        while towakeup and tries < maxTries:

            tries = tries + 1

            print "STARTING TRY", tries

            for p in towakeup:
                print "Calling", p
                call1 = client.calls.create(
                      url=confurl
                    , to = p.phone
                    , from_ = fromnumber
                    , timeout = dialingtimeout
                    , fallback_method = 'Post'
                    , fallback_url=fallbackurl
                    , if_machine = 'Hangup'
                    , status_callback = noanswerurl
                    , status_method = 'Post'
                    , record=True)

            print "\n\n"
            #            time.sleep(waitingtime)
            raw_input('Press enter to continue')

            flush_transaction() # We flush so that the changes reflect in the database
            calls = UserProfile.objects.filter()

        # TODO Set anyone with active=true to active=false+alarmon=false
