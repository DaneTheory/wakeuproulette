from django.contrib import admin
from wakeup.models import Call, Conference, Recording
from accounts.models import UserProfile, Contact

class ConferenceAdmin(admin.ModelAdmin):
    list_display = ['conferenceid', 'maxcapacity', 'datecreated', 'related_calls']

class CallAdmin(admin.ModelAdmin):
    list_display = ['pk', 'user', 'callduration', 'answered', 'matched', 'completed', 'rated', 'errorcode', 'rating', 'datecreated', 'retries']

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'alarmon', 'reputation', 'phone', 'gender', 'warnings', 'femalematch', 'malematch', 'any_match']

admin.site.register(Conference, ConferenceAdmin)
admin.site.register(Call, CallAdmin)

admin.site.unregister(UserProfile)
admin.site.register(UserProfile, UserProfileAdmin)

admin.site.register(Recording)
admin.site.register(Contact)