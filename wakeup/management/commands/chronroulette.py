from django.core.management.base import NoArgsCommand, make_option
from accounts.models import UserProfile
from datetime import datetime, timedelta
from twilio.rest import TwilioRestClient
from wakeup.models import Conferences
import time
from django.conf import settings


class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current 15 minute window."

    option_list = NoArgsCommand.option_list + (
            make_option('--verbose', action='store_true'),
        )

    def handle_noargs(self, **options):
        now = datetime.now()
        rounded = now.minute - (now.minute % 30)  # +2 to avoid errors due to chron executed milliseconds before
        schedule = timedelta(hours=now.hour, minutes=rounded)

        self.stdout.write("Wake Up Chron Roulette Started - " + str(schedule), ending='\n\n')

        # towakeup = UserProfile.objects.filter(alarm=schedule)

        # For now:
        towakeup = UserProfile.objects.all()

        lazy1 = None
        lazy2 = None

        for person in towakeup:
            self.stdout.write("phone: " + str(person.phone) + " alarm: " + str(person.alarm), ending='\n')
            if not person.phone or not person.alarm: continue
            if not lazy1:
                lazy1 = person
                continue

            lazy2 = person

            now = datetime.now()
            formatted = str(now.date()) + "-" + str(now.hour) + "-" + str(now.minute)
            confname = lazy1.user.username + "-" + lazy2.user.username + "-" + str(formatted)

            self.stdout.write("Setting up conf '" + confname + "' between "
                              + lazy1.user.username + "(" + lazy1.phone
                              + ") and " + lazy2.user.username + "("
                              + lazy2.phone + ")", ending='\n')

            conference = Conferences()
            conference.caller1 = lazy1.user
            conference.caller2 = lazy2.user
            conference.save()

            #Executing the call
#            account = "ACec726addfea1edac5453bd145016afe3"
#            token = "c9d9cef551e38290685a4e0649e0de9a"
#            client = TwilioRestClient(account, token)
#            confurl = settings.WEB_ROOT + "conf/" + confname
#
#            call1 = client.calls.create(url=confurl,
#                to=lazy1.phone,
#                from_="+441254313305")
#            call2 = client.calls.create(url=confurl,
#                to=lazy2.phone,
#                from_="+441254313305")

            lazy1 = None
            lazy2 = None


        if lazy1:
            self.stdout.write("\nOdd number of people. "
                              + lazy1.user.username + " (" + lazy1.phone
                              + ") did not find a match.", ending='\n')

        #Wait 60 seconds before sending feedback texts
#        time.sleep(30)
#
#        for person in towakeup:
#            client.messages.create(to=person.phone, from_="+441254313305", body='Rate your wake up buddy - reply to this number for free with "Good" or "Bad"!\n We wish you an awesome day!')