from django.core.management.base import NoArgsCommand


from accounts.models import UserProfile
from wakeup.models import Call



class Command(NoArgsCommand):

    help = "Finish a task."

    def handle_noargs(self, **options):

        print "doing stuff..."

        calls = Call.objects.all()

        for call in calls:
            if call.recording:
                call.recording.privacy = 'P'
                call.recording.save()


        print "Done doing stuff."