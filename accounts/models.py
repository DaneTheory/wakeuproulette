from django.db import models

from django.contrib.auth.models import User
from django.utils.translation import ugettext as _
from userena.models import UserenaBaseProfile

class UserProfile(UserenaBaseProfile):
    user = models.OneToOneField(User,unique=True,
        verbose_name=_('user'),related_name='profile')
    firstname = models.CharField(_("First Name"), max_length=15, null=True, blank=True)
    lastname = models.CharField(_("Last Name"), max_length=15, null=True, blank=True)
    alarm = models.TimeField(_("Alarm Time"), null=True, blank=True)
    phone = models.CharField(_("Phone Number"), max_length=20)
    reputation = models.IntegerField(_("Reputation"), default=0, null=True, blank=True)

