from django.contrib import admin
from .models import UserProfile, TagActivityRecord


admin.site.register(UserProfile)
admin.site.register(TagActivityRecord)