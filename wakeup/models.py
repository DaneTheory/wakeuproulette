from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _

import datetime
from django.utils.timezone import utc

RATING_CHOICES = (
                    ('U', 'Up'),
                    ('D', 'Down'),
                    ('R', 'Report')
                )

class Conference(models.Model):
    conferenceid = models.AutoField(primary_key=True)
    maxcapacity = models.IntegerField(_("Max Capacity"))

    datecreated = models.DateTimeField()

    def available(self):
        return self.call_set.count() < self.maxcapacity


class Call(models.Model):
    conference = models.ForeignKey(Conference, null=True)
    user = models.ForeignKey(User)
    callduration = models.IntegerField(_("Recording Duration"), default=0)

    # Call Flags
    answered = models.BooleanField(_("Answered and Awake"), default=False)
    matched = models.BooleanField(_("Has been matched"), default=False)
    completed = models.BooleanField(_("Completed Successfully"), default=False)
    errorcode = models.CharField(_("Error Code"), max_length=5, default="", blank=True)

    rating =  models.CharField(max_length=1, choices=RATING_CHOICES, blank=True, default="")

    # This field keeps track of the retries to connect call, find a match or get rating
    retries = models.IntegerField(_("Re-tries to connect call/match"), default=0)

    datecreated = models.DateTimeField()

    recordingurl = models.CharField(_("Recording URL"), max_length=200, null=True, blank=True, unique=True)
    recordingduration = models.IntegerField(_("Recording Duration"), default=0)

    # Reload itself from database
    def reload(self):
        new_self = self.__class__.objects.get(pk=self.pk)
        self.__dict__.update(new_self.__dict__)

    def __unicode__(self):
        return "Call - " + self.user.username + " matched: " + str(self.matched)
