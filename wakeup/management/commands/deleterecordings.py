from django.core.management.base import NoArgsCommand, make_option
from twilio.rest import TwilioRestClient
from wakeup.models import Conferences
from accounts.models import UserProfile

class Command(NoArgsCommand):

    help = "Excecute Chron Wake Up Chron Roulette for the current batch of wake-ups."

    option_list = NoArgsCommand.option_list + (
        make_option('--verbose', action='store_true'),
        )

    def handle_noargs(self, **options):
        account = "AC8f68f68ffac59fd5afc1a3317b1ffdf8"
        token = "5a556d4a9acf96753850c39111646ca4"
        client = TwilioRestClient(account, token)

        records = client.recordings.list()

        print "Deleting recordings"

        while records:
            print "Going again...\n"
            for rec in records:
                print "Deleting: ", rec.sid
                try:
                    client.recordings.delete(sid=rec.sid)
                except Exception:
                    print "Recording not found..."

            records = client.recordings.list()