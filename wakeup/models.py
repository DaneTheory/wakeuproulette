from django.db import models
from django.contrib.auth.models import User

import datetime
from django.utils.timezone import utc

class Conferences(models.Model):
    conferenceid = models.AutoField(primary_key=True)
    caller1 = models.ForeignKey(User,related_name='caller1')
    caller2 = models.ForeignKey(User,related_name='caller2')
    caller1done = models.BooleanField("Caller 1 Done", default=False)
    caller2done = models.BooleanField("Caller 2 Done", default=False)
