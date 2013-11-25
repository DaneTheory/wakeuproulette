from django.contrib import admin
from wakeup.models import Call, Conference
from accounts.models import UserProfile

class ConferenceAdmin(admin.ModelAdmin):
    list_display = ['conferenceid', 'maxcapacity', 'datecreated', 'related_calls']

class CallAdmin(admin.ModelAdmin):
    list_display = ['pk', 'user', 'callduration', 'answered', 'matched', 'completed', 'rated', 'errorcode', 'rating', 'datecreated', 'recordingduration', 'recordingurl', 'retries']

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'alarmon', 'reputation', 'phone', 'gender', 'warnings']

admin.site.register(Conference, ConferenceAdmin)
admin.site.register(Call, CallAdmin)

admin.site.unregister(UserProfile)
admin.site.register(UserProfile, UserProfileAdmin)