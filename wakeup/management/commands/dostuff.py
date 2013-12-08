from django.core.management.base import NoArgsCommand


from accounts.models import UserProfile
from wakeup.models import Call



class Command(NoArgsCommand):

    help = "Finish a task."

    def handle_noargs(self, **options):

        print "doing stuff..."

        for u in UserProfile.objects.all():
            u.mugshot = ""
            u.save()


        print "Done doing stuff."