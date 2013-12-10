from django.contrib import admin
from wakeup.models import Call, Conference, Recording, RecordingComment, RecordingRating, RecordingShare, WakeUp
from accounts.models import UserProfile, Contact, MessageVerification

class ConferenceAdmin(admin.ModelAdmin):
    list_display = ['conferenceid', 'maxcapacity', 'datecreated', 'related_calls']

class CallAdmin(admin.ModelAdmin):
    list_display = ['pk', 'user', 'callduration', 'answered', 'matched', 'completed', 'rated', 'get_match', 'errorcode', 'rating', 'datecreated', 'retries']

class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'alarmon', 'alarm', 'reputation', 'phone', 'gender', 'warnings', 'femalematch', 'malematch', 'any_match', 'recurring', 'is_verified', 'activated']
    ordering = ('-alarmon', '-alarm')

class MessageVerificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'verified', 'time_sent', 'time_verified']

admin.site.register(Conference, ConferenceAdmin)
admin.site.register(Call, CallAdmin)

admin.site.unregister(UserProfile)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(MessageVerification, MessageVerificationAdmin)

admin.site.register(RecordingShare)
admin.site.register(Recording)
admin.site.register(Contact)
admin.site.register(RecordingComment)
admin.site.register(RecordingRating)
admin.site.register(WakeUp)