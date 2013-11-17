from django.db import models
from django.contrib.auth.models import User

import datetime
from django.utils.timezone import utc

class Conferences(models.Model):
    conferenceid = models.AutoField(primary_key=True)
    conferencename = models.CharField("Conference Name", max_length=100, db_index = True, unique=True)
    caller1 = models.ForeignKey(User,related_name='caller1', null=True, blank=True)
    caller2 = models.ForeignKey(User,related_name='caller2', null=True, blank=True)
    recordingurl = models.CharField("Recording URL", max_length=200, null=True, blank=True)
    recordingduration = models.IntegerField("Recording Duration", null=True, blank=True)
    datecreated = models.DateTimeField(auto_now_add=True)
