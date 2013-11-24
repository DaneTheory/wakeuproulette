from django.db import models

from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from userena.models import UserenaBaseProfile
from datetime import time, date


GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )

class UserProfile(UserenaBaseProfile):
    user = models.OneToOneField(User,unique=True, verbose_name=_('user'),related_name='profile')
    alarm = models.TimeField(_("Alarm Time"), default=time(8))
    dob = models.DateField(_("Date of Birth"), null=True, blank=True)

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




