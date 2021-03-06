from django.db import models

from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from userena.models import UserenaBaseProfile
from wakeup.tools.toolbox import sms_async, send_async_mail
from datetime import time, date
from wakeup.models import RecordingRating, Recording
from wakeuproulette.settings import EMAIL_HOST_USER
from django.core.urlresolvers import reverse

GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )

MEMBERSHIP_CHOICES = (
        ('P', 'Premium'),
        ('F', 'Fremium'),
    )

CONTACT_TYPE_CHOICES = (
        ('F', 'Friend'),
        ('A', 'Acquaintance'),
        ('R', 'Relative'),
    )
CONTACT_STATUS_CHOICES = (
        ('P', 'Pending'),
        ('A', 'Accepted'),
        ('B', 'Blocked'),
    )


# This table will have two entries per contact made
class Contact(models.Model):
    user = models.ForeignKey(User, related_name="contacts")
    contact = models.ForeignKey(User, related_name="to_contacts")

    status = models.CharField(max_length=1, choices=CONTACT_STATUS_CHOICES, default='P')

    # TODO: Maybe give the option to the users to specify their groups in their contacts
    type = models.CharField(_("Contact Type"), max_length=1, choices=CONTACT_TYPE_CHOICES, default='A')

    datecreated = models.DateTimeField(_("DateTime Created"), auto_now_add=True, editable=True)

class UserProfile(UserenaBaseProfile):
    user = models.OneToOneField(User,unique=True, verbose_name=_('user'),related_name='profile')
    alarm = models.TimeField(_("Alarm Time"), default=time(8))
    dob = models.DateField(_("Date of Birth [DD/MM/YYYY]"), null=True, blank=True)

    # Current membership - could be premium or freemium
    membership = models.CharField(_("Membership Type"), max_length=1, choices=MEMBERSHIP_CHOICES, default='F')

    # Whether user wants to wait in a private room or a waiting room
    roomdesired = models.BooleanField(_('Waiting Room Desired'), default=False)

    # Whether the user would like to store his recordings
    recording = models.BooleanField(_('Recording Desired'), default=True)

    # alarmon - If the alarm is on, the user will be considered to be sleeping - if it's off, he is awake
    alarmon = models.BooleanField(_("Alarm On"), default=False)

    snoozelimit = models.IntegerField(_("Snooze Limit"), default=3)

    # These are the number of times the user has been reported
    warnings = models.IntegerField(_("Warnings"), default=0)

    phone = models.CharField(_("Phone Number"), max_length=20, unique=True)
    reputation = models.IntegerField(_("Reputation"), default=0, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    femalematch = models.BooleanField(_("Female Match"), default=True)
    malematch = models.BooleanField(_("Male Match"), default=True)
    any_match = models.BooleanField(default=False)
    
    activated = models.BooleanField(default=False)

    recurring = models.BooleanField(default=False)

    emailnotifications = models.BooleanField(_("Email Notifications"), default=True)

    white = models.BooleanField(_('Light Theme'), default=True)

    ######## CONTACTS ########

    def confirm_contact(self, user):
        # Raise contact does not exist if this connection doesn't exist
        contact = self.user.related_self.get(user=self, contact=user)
        other = user.related_self.get(user=user, contact=self)

        # Make sure that contact status is Pending
        if contact.status != 'P' or other.status != 'P':
            # TODO Report and Log error, as a confirm_request shouldn't be made if there isn't a pending request
            print "Contact status is not Pending! Contact1", contact.user, contact.status, "Contact2", other.user, other.status
            return False

        contact.status = 'A'
        other.status = 'A'

        # TODO Create SIGNAL to notify users that their friend request has been accepteds
        contact.save()
        other.save()

    # Contact between two persons is requested - an instance is created with status 'Pending'
    def request_contact(self, user):
        # Check if they are already contacts
        if not self.is_contact(user):
            try:
                other_contact = user.contacts.get(user=user, contact=self.user)
                other_contact.status = 'A'
                other_contact.save()
                Contact.objects.create(user=self.user, contact=user, status='A')
            except Contact.DoesNotExist:
                Contact.objects.create(user=self.user, contact=user, status='P')

#            # Check if self recording is valid and other is valid
#            if self.recording and self.recording.recordingurl and self.recordin.recordingduration:
#                if user.profile.recording and user.profile.recording.recordingurl and user.profile.recording.recordingduration:
#                    if user.profile.recording

    def is_contact(self, user):
        try:
            return self.user.contacts.get(user=self.user, contact=user)
        except Contact.DoesNotExist:
            return None

    def get_contacts(self):
        return Contact.objects.filter(user=self.user, status='A')

    def get_requests(self):
        return Contact.objects.filter(contact=self.user, status='P')

    def get_alarm_time(self):
        return self.alarm.strftime("%H:%M")

    def send_comment_notification_email(self, user):
        send_async_mail("WakeUpRoulette New Comment", self.user.username + " has just commented in your WakeUp. To reply, please go to " + self.user.username + "'s profile page at http://wakeuproulette.com" + reverse("accounts.views.wakeup_public", args=[self.user.username]) + ".", EMAIL_HOST_USER, [user.email])
    
    def send_request_contact_email(self, user):
        send_async_mail("WakeUpRoulette Contact Request", self.user.username + " has added you to the contacts. To accept the request, please go to " + self.user.username + "'s profile page at http://wakeuproulette.com" + reverse("accounts.views.wakeup_public", args=[self.user.username]) + ".", EMAIL_HOST_USER, [user.email])

    def send_accept_contact_email(self, user):
        send_async_mail("WakeUpRoulette Accepted Request", self.user.username + " has accepted your request. To see the profile page of " + self.user.username + " please go to http://wakeuproulette.com" + reverse("accounts.views.wakeup_public", args=[self.user.username]) + ".", EMAIL_HOST_USER, [user.email])


    ######## VERIFICATION ########

    def is_verified(self):
        return self.user.messageverification.verified

    def activate_account(self, message=None):
        if not self.is_verified():
            print "Could not activate as user is not verified."
            return
        self.activated = True
        self.save()
        if not message: message = "Your WakeUpRoulette account has been activated! You can now access your dashboard!"
        sms_async(self.user.profile.phone, message)


    ######## RECORDINGS ########

    def rated(self, recording):
        return RecordingRating.objects.get(user=self.user)

    def img_url(self):
        return self.mugshot.url if self.mugshot else ('/media/images/man-placeholder.jpg' if self.gender == 'M' else '/media/images/woman-placeholder.jpg')


    def g(self,him, her):
        return him if self.gender == 'M' else her
    
class MessageVerification(models.Model):
    user = models.OneToOneField(User)
    code = models.CharField(_("Code"), max_length=4)
    verified = models.BooleanField(default=False)
    time_sent = models.DateTimeField(auto_now_add=True)
    time_verified = models.DateTimeField(null=True, blank=True)
    
