from django.core.management.base import NoArgsCommand
from accounts.models import UserProfile
from datetime import datetime, timedelta
from twilio.rest import TwilioRestClient
from wakeup.models import Call
import time
from django.db import transaction
from django.conf import settings
from wakeup.tools.toolbox import call_async


# Settings Variables
maxTries = 1
round = 60
waitingtime = 60*5




@transaction.commit_manually
def flush_transaction():
    transaction.commit()


class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current batch of wake-ups."

    def handle_noargs(self, **options):

        schedule = datetime.now()

        # Round to the nearest X minutes
        discard = timedelta(   minutes=schedule.minute % round,
                                        seconds=schedule.second,
                                        microseconds=schedule.microsecond)
        schedule -= discard
        if discard >= timedelta(minutes=round/2):
            schedule += timedelta(minutes=round)

        confname = str(schedule.strftime("%d:%m:%y:%H:%M:%S"))
        confurl = settings.WEB_ROOT + "wakeuprequest/" + confname
        noanswerurl = settings.WEB_ROOT + 'answercallback/' + confname
        fallbackurl = settings.WEB_ROOT + 'fallback/' + confname

        towakeup = UserProfile.objects.filter(alarm=schedule).filter(alarmon=True, activated=True)

        print "START ################# Wake Up Chron Roulette Started - " + str(schedule) + "##################"
        print str(towakeup)

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
            print str(towakeup)

            print "STARTING TRY " + str(tries)

            for p in towakeup:
                print "Calling " + p.user.username + " Phone: " + p.phone
                call_async(p.phone, confurl, fallbackurl, noanswerurl, silent=True)

            print "Waiting " + str(waitingtime) + " seconds..."
            time.sleep(waitingtime)
#            raw_input('Press enter to continue')

            # Flush so that the changes reflect in the database
            flush_transaction()
            towakeup = UserProfile.objects.filter(alarmon=True).filter(user__call__datecreated=schedule, user__call__answered=False)
            Call.objects.filter(datecreated=schedule, answered=False).update(snoozed=True)


        print "Finished... Cleaning up (setting alarmon=False, any_match=False)"
        # To finish turn everyone's alarm off
        UserProfile.objects.filter(user__call__datecreated=schedule).update(alarmon=False, any_match=False)