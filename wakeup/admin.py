from django.contrib import admin
from wakeup.models import Call, Conference

admin.site.register(Conference)
admin.site.register(Call)