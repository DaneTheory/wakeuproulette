from django.core.management.base import NoArgsCommand
from accounts.models import UserProfile, Contact
from datetime import datetime, timedelta
from twilio.rest import TwilioRestClient
from wakeup.models import Call, WakeUp
import time
from django.db import transaction
from django.conf import settings
from wakeup.tools.toolbox import call_async

from django.db.models import Q



# Settings Variables
if settings.PROD:
    maxTries = 2
    round = 60
    waitingtime = 60*5

else:
    maxTries = 1
    round = 60
    waitingtime = 65


@transaction.commit_manually
def flush_transaction():
    transaction.commit()

class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current batch of wake-ups."

    def handle_noargs(self, **options):

        schedule = datetime.now()
        emailschedule = schedule

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

        alarm_match = UserProfile.objects.filter(alarm=schedule, alarmon=True, activated=True)
        wakeup_match = WakeUp.objects.filter(schedule=schedule)

        already = set()

        print alarm_match
        print wakeup_match

        for w in wakeup_match:
            if w.user.id in already: continue
            c = Call()
            c.user = w.user
            c.datecreated = schedule
            c.save()
            already.add(w.user.id)

        for u in alarm_match:
            if u.id in already: continue
            c = Call()
            c.user = u.user
            c.datecreated = schedule
            c.save()
            already.add(w.user.id)


        tries = 0
        while True:

            tries = tries + 1

            # Flush so that the changes reflect in the database
            flush_transaction()
            towakeup = UserProfile.objects.filter(user__call__datecreated=schedule, user__call__answered=False)

            print "STARTING TRY " + str(tries)
            print str(towakeup)

            for p in towakeup:
                print "Calling " + p.user.username + " Phone: " + p.phone
                call_async(p.phone, confurl, fallbackurl, noanswerurl, silent=True)


            print "Waiting " + str(waitingtime) + " seconds..."
            time.sleep(waitingtime)

            # Setting people who didn't answered on the first time to snoozed = True
            Call.objects.filter(datecreated=schedule, answered=False).update(snoozed=True)
            Call.objects.filter(datecreated=schedule, answered=True).update(completed=True)

            contact_requests = Contact.objects.filter(datecreated__gt=emailschedule).filter(status='P')
            for contact_request in contact_requests:
                contact_request.user.profile.send_request_contact_email(contact_request.contact)

            # sending accepted contact request emails
            accepted_contacts = Contact.objects.filter(datecreated__gt=emailschedule).filter(status='A')
            for accepted_contact in accepted_contacts:
                accepted_contact.user.profile.send_accept_contact_email(accepted_contact.contact)

            emailschedule = datetime.now()

            if not towakeup or tries >= maxTries:
                break


        print "Finished... Cleaning up (setting alarmon=False, any_match=False)"
        # To finish turn everyone's alarm off
        UserProfile.objects.filter(user__call__datecreated=schedule).update(any_match=False)
        UserProfile.objects.filter(user__call__datecreated=schedule, recurring=False).update(alarmon=False)