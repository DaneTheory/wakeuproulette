from django.core.management.base import NoArgsCommand, make_option
from accounts.models import UserProfile
from datetime import datetime, timedelta
from twilio.rest import TwilioRestClient
from wakeup.models import Conferences
import time
from django.conf import settings

class ConferenceObject(object):

    def get_waiting(self):
        if self.u1: return self.u1
        if self.u2: return self.u2
        return None

    def is_empty(self):
        return not (self.u1 or self.u2)

    def is_full(self):
        return self.u1 and self.u2

    def is_done(self):
        return self.is_full() and not (self.u1.active and self.u2.active)

    def call(self):
        #Executing the call
        account = "AC8f68f68ffac59fd5afc1a3317b1ffdf8"
        token = "5a556d4a9acf96753850c39111646ca4"
        client = TwilioRestClient(account, token)
        confurl = settings.WEB_ROOT + "conf/" + self.confName
        timeout = 15

        if self.u1 and self.u1.alarmon:
            call1 = client.calls.create(
                url=confurl
                , to = self.u1.phone
                , from_ = "+441279702159"
                , timeout = timeout
                , fallback_method = 'POST'
                , fallback_url=confurl
                , status_callback=confurl
                , if_machine = 'Hangup')

        # Check if the u2 variable is set
        if self.u2 and self.u2.alarmon:
            call2 = client.calls.create(
                url=confurl
                , to = self.u2.phone
                , from_ = "+441279702159"
                , timeout = 5
                , fallback_method = 'POST'
                , fallback_url=confurl
                , status_callback=confurl
                , if_machine = 'Hangup')

    def __init__(self, name, u1=None, u2=None):
        self.confName = name
        self.u1 = u1
        self.u2 = u2
        self.u1Done = False
        self.u2Done = False


class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current 15 minute window."

    option_list = NoArgsCommand.option_list + (
            make_option('--verbose', action='store_true'),
        )

    def handle_noargs(self, **options):

        def matches(p1, p2):
            return p1.gender != p2.gender

        def match_pairs(waiting):
            stillwaiting = []
            sleeping = []
            pairs = []

            for person in waiting.keys():
                if person.alarmon:
                    sleeping.append(person)
                else:
                    stillwaiting.append(person)

            print sleeping
            print stillwaiting
            # We pair up people still sleeping with people waiting first
            while len(stillwaiting):
                currwaiting = stillwaiting.pop()

                # If we don't find a match, he will get waken up through the robot
                found = None
                for curr in sleeping:
                    if matches(curr, currwaiting):
                        found = curr
                        break

                if found: sleeping.remove(found)

                pairs.append(currwaiting, found)

            # We then pair up people who are currently sleeping between them
            while len(sleeping):
                currwaiting = sleeping.pop()

                # If we don't find a match, he will get waken up through the robot
                found = None
                for curr in sleeping:
                    if curr == currwaiting: continue

                    if matches(curr, currwaiting):
                        found = curr
                        break

                pairs.append((currwaiting, found))

            return pairs

        def get_free_conference_room(liveConferences):
            for conf in liveConferences:
                if conf.is_empty(): return conf

            conf = ConferenceObject("Conf-" + str(len(liveConferences)) + "-" + str(schedule))
            liveConferences.append(conf)
            return conf

        # Populate rooms based on specific matches
        def populate_rooms(liveConferences, waiting, usersToConferences):

            pairs = match_pairs(waiting)
            unmatchedPeople = []

            for pair in pairs:
                p1 = pair[0]
                p2 = pair[1]

                # Check if no matches were found
                if not (p1 or p2):
                    if p1: unmatchedPeople.append(p1)
                    else: unmatchedPeople.append(p2)
                    continue

                conf = None

                if p1 and waiting[p1] and p1 in usersToConferences: conf = usersToConferences[p1]
                if p2 and waiting[p2] and p2 in usersToConferences[p2]: conf = usersToConferences[p2]

                if not conf: conf = get_free_conference_room(liveConferences)

                conf.u1 = p1
                conf.u2 = p2

                conf.call()

            return unmatchedPeople


            # Remove any conference rooms that have finished
            # Remove any users that are not currently waiting in the Conference Rooms
            # Return a dictionary mapping the users to the current conference room they are in
        def clear_innactive(waiting, liveConferences):
            usersToConferences = {}

            for conf in liveConferences:
                # Remove conference room that has already been fulfilled
                if conf.is_done():
                    del conf
                    continue

                # Clear users if they didn't answer the phone - hence they are not waiting
                if conf.u1:
                    if not waiting[conf.u1]: conf.u1 = None
                    else: usersToConferences[conf.u1] = conf

                if conf.u2:
                    if not waiting[conf.u2]: conf.u2 = None
                    else: usersToConferences[conf.u2] = conf

            return usersToConferences


        now = datetime.now()
        minute = now.minute + 2  # +2 to avoid errors due to chron executed milliseconds before
        rounded = minute - (minute % 30)
        schedule = timedelta(hours=now.hour, minutes=rounded)

        self.stdout.write("Wake Up Chron Roulette Started - " + str(schedule), ending='\n\n')

        # towakeup = UserProfile.objects.filter(alarm=schedule)

        towakeup = UserProfile.objects.filter(alarmon=True)
        towakeup.update(active=True)
        total = towakeup.count()
        waiting = {}
        liveConferences = []
        maxTries = 2
        waitingtime = 20


        for user in towakeup:
            waiting[user] = not user.alarmon

        # Creating all empty conferences
        for i in xrange((total+1)/2):
            confname = "Conf-" + str(i) + "-" + str(schedule)
            liveConferences.append(ConferenceObject(confname))

        unmatchedPeople = None

        tries = 0
        # Iterate until we don't have any more people we need to wake up, or our tries have ran out
        while towakeup and tries < maxTries:

            tries = tries + 1
            towakeup = UserProfile.objects.filter(active=True)

            usersToConferences = clear_innactive(waiting, liveConferences)
            unmatchedPeople = populate_rooms(liveConferences, waiting, usersToConferences)

            print "Waiting " + str(waitingtime) + " Seconds"
            time.sleep(waitingtime)


        # Wake up all the ForeverAlloners lol
        print "Time to wake up all the ForeverAlone people... lol"
        print unmatchedPeople
        if unmatchedPeople:
            for unlucky in unmatchedPeople:
                conf = get_free_conference_room(liveConferences)
                print conf.confName
                conf.u1 = unlucky

                conf.call()


#        towakeup.update(active=False, alarmon=False)
        towakeup.update(active=False)


    #Wait 60 seconds before sending feedback texts
#        time.sleep(30)
#
#        for person in towakeup:
#            client.messages.create(
#                  to=person.phone
#                , from_="+441279702159"
#                , body='Rate your wake up buddy - reply to this number for free with "Good" or "Bad"!\n '
#                       'We wish you an awesome day!')

