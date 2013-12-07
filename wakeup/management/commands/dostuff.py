from django.core.management.base import NoArgsCommand

from accounts.models import UserProfile
from wakeup.models import Recording, RecordingShare, RecordingComment, Call



class Command(NoArgsCommand):

    help = "Finish a task."

    def handle_noargs(self, **options):

        print "doing stuff..."


        u = UserProfile.objects.all()[0].user

        calls = Call.objects.filter(user=u)

        for call in calls:
            share = RecordingShare()
            share.call = call
            share.user = u

            share.body = "Do you see any Teletubbies in here? Do you see a slender plastic tag clipped to my shirt with my name printed on it? Do you see a little Asian child with a blank expression on his face sitting outside on a mechanical helicopter that shakes when you put quarters in it? No? Well, that's what you see at a toy store. And you must think you're in a toy store, because you're here shopping for an infant named Jeb."

            share.save()

            comment = RecordingComment()
            comment.comment = "NO!"
            comment.recordingshare = share
            comment.user = u
            comment.save()


        print "Done doing stuff."