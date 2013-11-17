from django.core.management.base import NoArgsCommand, make_option
from accounts.models import UserProfile
from datetime import datetime, timedelta
from twilio.rest import TwilioRestClient
from wakeup.models import Conferences
import time
from django.conf import settings
from django.db import transaction
import random

@transaction.commit_manually
def flush_transaction():
    transaction.commit()


class ConferenceObject(object):

    def get_waiting(self):
        if self.p1: return self.p1
        if self.p2: return self.p2
        return None

    def is_empty(self):
        return not (self.p1 or self.p2)

    def is_full(self):
        return self.p1 and self.p2

    def is_done(self):
        return self.is_full() and not (self.p1.alarmon or self.p2.alarmon)

    def call(self):
        #Executing the call
        account = "AC8f68f68ffac59fd5afc1a3317b1ffdf8"
        token = "5a556d4a9acf96753850c39111646ca4"
        client = TwilioRestClient(account, token)
        confurl = settings.WEB_ROOT + "conf/" + self.confName
        timeout = 15

        if self.p1 and self.p1.alarmon:
            print "Calling", self.p1, self.p1.alarmon
#            call1 = client.calls.create(
#                  url=confurl
#                , to = self.p1.phone
#                , from_ = "+441279702159"
#                , timeout = timeout
#                , fallback_method = 'POST'
#                , fallback_url=confurl
#                , if_machine = 'Hangup')

        # Check if the p2 variable is set
        if self.p2 and self.p2.alarmon:
            print "Calling", self.p2, self.p2.alarmon
#            call2 = client.calls.create(
#                  url=confurl
#                , to = self.p2.phone
#                , from_ = "+441279702159"
#                , timeout = 5
#                , fallback_method = 'POST'
#                , if_machine = 'Hangup')

    def __init__(self, name, p1=None, p2=None):
        self.confName = name
        self.p1 = p1
        self.p2 = p2
        self.p1Done = False
        self.p2Done = False


class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current 15 minute window."

    option_list = NoArgsCommand.option_list + (
            make_option('--verbose', action='store_true'),
        )

    def handle_noargs(self, **options):

        def matches(p1, p2):
            return p1.gender != p2.gender

        def match_pairs(waiting):
            print "MATCHING PAIRS"

            stillwaiting = []
            sleeping = []
            pairs = []

            shuffled = waiting.keys()
            random.shuffle(shuffled)

            for person in shuffled:
                if person.alarmon:
                    sleeping.append(person)
                else:
                    stillwaiting.append(person)

            print "sleeping: ", sleeping
            print "stillwaiting: ", stillwaiting
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

                pairs.append((currwaiting, found))

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

                if found: sleeping.remove(found)

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

                conf = None

                if p1 and waiting[p1] and p1 in usersToConferences: conf = usersToConferences[p1]
                if p2 and waiting[p2] and p2 in usersToConferences[p2]: conf = usersToConferences[p2]

                if not conf: conf = get_free_conference_room(liveConferences)

                # Check if no matches were found
                print "Printing p1, p2: ", p1, p2
                if not (p1 and p2):
                    if p1: unmatchedPeople.append(p1)
                    elif p2: unmatchedPeople.append(p2)
                    continue
                else:
                    conf.p1 = p1
                    conf.p2 = p2
                    conf.call()

            return unmatchedPeople


        # Remove any conference rooms that have finished
        # Remove any users that are not currently waiting in the Conference Rooms
        # Return a dictionary mapping the users to the current conference room they are in
        def clear_innactive(waiting, liveConferences):
            usersToConferences = {}

            for conf in liveConferences:
                if conf.p1: conf.p1.reload()
                if conf.p2: conf.p2.reload()

                # Remove conference room that has already been fulfilled
                print "CONFERENCE: ", conf.p1, conf.p2,     \
                    conf.p1.alarmon if conf.p1 else "",     \
                    conf.p2.alarmon if conf.p2 else "",     \
                    conf.is_done()

                # If the confernce room is occupied and active, remove it, and set its users to innactive
                if conf.is_done():
                    conf.p1.active = False
                    conf.p1.save()
                    conf.p2.active = False
                    conf.p2.save()

                    del waiting[conf.p1]
                    del waiting[conf.p2]
                    liveConferences.remove(conf)
                    continue

                # Clear users if they didn't answer the phone - hence they are not waiting
                if conf.p1:
                    if conf.p1.alarmon: conf.p1 = None
                    else:
                        usersToConferences[conf.p1] = conf

                if conf.p2:
                    if conf.p2.alarmon: conf.p2 = None
                    else:
                        usersToConferences[conf.p2] = conf

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
        maxTries = 3
        waitingtime = 40

        for profile in towakeup:
            waiting[profile] = False

        unmatchedPeople = None

        tries = 0
        # Iterate until we don't have any more people we need to wake up, or our tries have ran out
        while waiting and tries < maxTries:

            tries = tries + 1

            print "STARTING TRY", tries

            usersToConferences = clear_innactive(waiting, liveConferences)
            unmatchedPeople = populate_rooms(liveConferences, waiting, usersToConferences)

            print "\n\n"
            time.sleep(waitingtime)
#            raw_input('Press enter to continue')

            flush_transaction() # We flush so that the changes reflect in the database
            towakeup = UserProfile.objects.filter(active=True)
            waiting = {}
            for profile in towakeup:
                waiting[profile] = not profile.alarmon


        # Wake up all the ForeverAlloners lol
        print "Time to wake up all the ForeverAlone people... lol"
        print unmatchedPeople
        if unmatchedPeople:
            for unlucky in unmatchedPeople:
                conf = get_free_conference_room(liveConferences)
                print conf.confName
                conf.p1 = unlucky

                conf.call()


        towakeup.update(active=False, alarmon=False)


    #Wait 60 seconds before sending feedback texts
#        time.sleep(30)
#
#        for person in towakeup:
#            client.messages.create(
#                  to=person.phone
#                , from_="+441279702159"
#                , body='Rate your wake up buddy - reply to this number for free with "Good" or "Bad"!\n '
#                       'We wish you an awesome day!')

