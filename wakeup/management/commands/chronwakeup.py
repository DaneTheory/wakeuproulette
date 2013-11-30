from django.core.management.base import NoArgsCommand, make_option
from accounts.models import UserProfile
from datetime import datetime, timedelta
from twilio.rest import TwilioRestClient
from wakeup.models import Call
import time
from django.conf import settings
from django.db import transaction
from wakeup.tools.toolbox import call_async
import random


# Settings Variables
maxTries = 1
waitingtime = 20


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
        print towakeup

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
                call_async(p.phone, confurl, fallbackurl, noanswerurl)

            print "\n\n"
            time.sleep(waitingtime)
            raw_input('Press enter to continue')

            # Flush so that the changes reflect in the database
            flush_transaction()
            towakeup = UserProfile.objects.filter(user__call__datecreated=schedule, user__call__answered=False)
            # TODO Set Call's Snoozed boolean to true if they didn't answer by the time we arrive here

        # To finish turn everyone's alarm off
        UserProfile.objects.filter(user__call__datecreated=schedule).update(alarmon=False)
