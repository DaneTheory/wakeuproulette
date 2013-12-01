from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _

import datetime
from django.utils.timezone import utc, now as timezonenow

PRIVACY_CHOICES = (
                    ('U', 'Unpublished'),
                    ('S', 'Secret'),
                    ('P', 'Published'),
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
    callduration = models.IntegerField(_("Recording Duration"), default=0)

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

    # Reload itself from database
    def reload(self):
        new_self = self.__class__.objects.get(pk=self.pk)
        self.__dict__.update(new_self.__dict__)

    def __unicode__(self):
        return "User " + self.user.username + " - Matched: " + str(self.matched)


class Recording(models.Model):

    recordingurl = models.CharField(_("Recording URL"), max_length=200, null=True, blank=True)
    recordingduration = models.IntegerField(_("Recording Duration"), default=0)

    call = models.OneToOneField(Call)

    # Initial on creation, states whether the Recording is shared, or each Recording is individual
    shared = models.BooleanField(_("Shared Recording"))
    # States whether (If Recording is shared) this recording is the one chosen to be displayed and used
    chosen = models.BooleanField(_("Selected (If Shared)"))
    # Points to its other caller's Recording
    other = models.OneToOneField('self', null=True)
    # States the current privacy of the Recording
    privacy = models.CharField(max_length=1, choices=PRIVACY_CHOICES)

    # Total number of times this recording has been played
    plays = models.IntegerField(_("Times Played"), default=0)

    # Rating of the recording for the call
    rating = models.IntegerField(_("My Rating"), default=0)

    # Number of times this call has been reported
    warnings = models.IntegerField(_("warnings"), default=0)

    datecreated = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.privacy:
            self.privacy = 'S' if self.shared else 'U'

        super(Recording, self).save(*args, **kwargs)


class RecordingRating(models.Model):

    recording = models.ForeignKey(Recording)
    user = models.ForeignKey(User)
    rated = models.BooleanField(_("Rating"), default=False)
    lastplayed = models.DateTimeField(_("Last time user played"), auto_now_add=True)
    reported = models.BooleanField(_("Reported"), default=False)

    datecreated = models.DateTimeField(auto_now_add=True)

    def last_viewed_one_hour(self):
        return self.lastplayed > timezonenow() - datetime.timedelta(hours=1)


class RecordingComment(models.Model):

    recording = models.ForeignKey(Recording)
    user = models.ForeignKey(User)

    comment = models.CharField(_("Comment"), max_length=300)



