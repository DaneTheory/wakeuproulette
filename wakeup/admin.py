from django.contrib import admin
from wakeup.models import Call, Conference

class ConferenceAdmin(admin.ModelAdmin):
    list_display = ['conferenceid', 'maxcapacity', 'datecreated', 'related_calls']

class CallAdmin(admin.ModelAdmin):
    list_display = ['pk', 'user', 'callduration', 'answered', 'matched', 'completed', 'errorcode', 'rating', 'datecreated', 'recordingduration', 'recordingurl', 'retries']

admin.site.register(Conference, ConferenceAdmin)
admin.site.register(Call, CallAdmin)