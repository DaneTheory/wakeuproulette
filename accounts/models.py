from django.db import models

from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from userena.models import UserenaBaseProfile
from datetime import time


GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
    )

class UserProfile(UserenaBaseProfile):
    user = models.OneToOneField(User,unique=True,
        verbose_name=_('user'),related_name='profile')
    alarm = models.TimeField(_("Alarm Time"), default=time(8))
    # alarmon - If the alarm is on, the user will be considered to be sleeping - if it's off, he is awake
    alarmon = models.BooleanField(_("Alarm On"), default=False)
    # active - States whether the user is currently being waken up
    active = models.BooleanField(_("Being Waken Up"), default=False)
    # booked - If the user is booked, the user is currently active and has been assigned a conference room
    booked = models.BooleanField(_("Conference Room Assigned"), default=False)

    snoozelimit = models.IntegerField(_("Snooze Limit"), default=0)
    redials = models.IntegerField(_("Current Snooze"), default=0)

    phone = models.CharField(_("Phone Number"), max_length=20, unique=True)
    reputation = models.IntegerField(_("Reputation"), default=0, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)

    def reload(self):
        new_self = self.__class__.objects.get(pk=self.pk)
        self.__dict__.update(new_self.__dict__)



