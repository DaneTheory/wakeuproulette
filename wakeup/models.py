from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from django.db.models import Q

import datetime
from django.utils.timezone import utc, now as timezonenow

PRIVACY_CHOICES = (
                    ('S', 'Secret'),
                    ('P', 'Public'),
                    ('D', 'Deleted'),
                )

class Conference(models.Model):
    conferenceid = models.AutoField(primary_key=True)
    maxcapacity = models.IntegerField(_("Max Capacity"))

    datecreated = models.DateTimeField()

    # For displaying correctly in the admin panel
    def related_calls(self):
        return '%s'%(self.call_set.all())
    related_calls.short_description = 'Call'

    def available(self):
        return self.call_set.count() < self.maxcapacity

    def __unicode__(self):
        return "Conference " + str(self.pk) + " MaxCapacity: " + str(self.maxcapacity) + " DateCreated " + str(self.datecreated)


class Call(models.Model):
    conference = models.ForeignKey(Conference, null=True)
    user = models.ForeignKey(User)
    callduration = models.IntegerField(_("Call Duration"), default=0)

    # This field points to a recording - a recording can be shared between two calls
    recording = models.ForeignKey('Recording', null=True, blank=True)

    # Call Flags
    snoozed = models.BooleanField(_("Snoozed"), default=False)
    answered = models.BooleanField(_("Answered"), default=False)
    matched = models.BooleanField(_("Matched"), default=False)
    completed = models.BooleanField(_("Completed"), default=False)
    errorcode = models.CharField(_("Error Code"), max_length=5, default="", blank=True)

    rated = models.BooleanField(_("Rated other?"), default=False)
    rating =  models.IntegerField(_("Rating"), default=0)

    # This field keeps track of the retries to connect call, find a match or get rating
    retries = models.IntegerField(_("Re-tries"), default=0)

    datecreated = models.DateTimeField()

#    def get_other_call(self):
#        other = self.conference.call_set.exclude(pk=call.pk)[0]

    # Reload itself from database
    def reload(self):
        new_self = self.__class__.objects.get(pk=self.pk)
        self.__dict__.update(new_self.__dict__)

    def get_match(self):
        try:
            return self.conference.call_set.exclude(pk=self.pk)[0].user.profile.get_full_name_or_username()
        except Exception:
            return ""



    def __unicode__(self):
        return "User " + self.user.username + " - Matched: " + str(self.matched)


class Recording(models.Model):

    recordingurl = models.CharField(_("Recording URL"), max_length=200, null=True, blank=True)
    recordingduration = models.IntegerField(_("Recording Duration"), default=0, null=True, blank=True)

    privacy = models.CharField(max_length=1, choices=PRIVACY_CHOICES, default='P')

    # Total number of times this recording has been played
    plays = models.IntegerField(_("Times Played"), default=0)

    # Total number of shares
    shares = models.IntegerField(_("Total Shares"), default=0)

    # Rating of the recording for the call
    rating = models.IntegerField(_("Recording Aura"), default=0)

    # Number of times this call has been reported
    warnings = models.IntegerField(_("warnings"), default=0)

    datecreated = models.DateTimeField(auto_now_add=True)

SHARES_LOAD_LIMIT = 5

class RecordingShare(models.Model):
    call = models.ForeignKey(Call)
    user = models.ForeignKey(User)

    body = models.TextField(_("Body"), default="", blank=True)

    rating = models.IntegerField(_("Recording Aura"), default=0)
    shares = models.IntegerField(_("Recording Aura"), default=0)

    warnings = models.IntegerField(_("Warnings"), default=0)

    datecreated = models.DateTimeField(auto_now_add=True)
    
    @staticmethod
    def query_list(params, request):
        upper_id = int(params.get("upper_id", "-1"))
        shares = RecordingShare.objects.filter(Q(user__contacts__contact=request.user, user__contacts__status='A') | Q(user=request.user)).order_by("-id")
        if upper_id != -1:
            shares = shares.filter(id__lt=upper_id)
        shares = shares.distinct()
        shares = shares[:SHARES_LOAD_LIMIT]
        return shares


class RecordingRating(models.Model):

    recordingshare = models.ForeignKey(RecordingShare)
    user = models.ForeignKey(User)

    rated = models.BooleanField(_("Rating"), default=False)
    reported = models.BooleanField(_("Reported"), default=False)

    datecreated = models.DateTimeField(auto_now_add=True)


class RecordingComment(models.Model):

    recordingshare = models.ForeignKey(RecordingShare)
    user = models.ForeignKey(User)

    comment = models.CharField(_("Comment"), max_length=300)




# Wakeuppers
class WakeUp(models.Model):
    user = models.ForeignKey(User)
    call = models.OneToOneField(Call, null=True, blank=True)

    schedule = models.DateTimeField(_("WakeUpper Time"))

    datecreated = models.DateTimeField(auto_now=True)





