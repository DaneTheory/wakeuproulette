from django.core.management.base import NoArgsCommand, make_option
from accounts.models import UserProfile
from datetime import datetime, timedelta
from twilio.rest import TwilioRestClient
from wakeup.models import Conferences
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

        now = datetime.now()
        minute = now.minute + 2  # +2 to avoid errors due to chron executed milliseconds before
        rounded = minute - (minute % 30)
#        schedule = timedelta(hours=now.hour, minutes=rounded)
        schedule = timedelta(hours=now.hour, minutes=now.minute, seconds=now.second)
        confname = str(schedule)
        confurl = settings.WEB_ROOT + "wakeuprequest/" + confname
        noanswerurl = settings.WEB_ROOT + 'answercallback/' + confname
        fallbackurl = settings.WEB_ROOT + 'fallback/' + confname

        self.stdout.write("Wake Up Chron Roulette Started - " + str(schedule), ending='\n\n')

        towakeup = UserProfile.objects.filter(alarmon=True)
        towakeup.update(active=True)

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
                    , fallback_method = 'POST'
                    , fallback_url=fallbackurl
                    , if_machine = 'Hangup'
                    , status_callback = noanswerurl
                    , status_method = 'Post'
                    , record=True)

            print "\n\n"
            #            time.sleep(waitingtime)
            raw_input('Press enter to continue')

            flush_transaction() # We flush so that the changes reflect in the database
            towakeup = UserProfile.objects.filter(alarmon=True)
