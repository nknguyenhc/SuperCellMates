from django.contrib import admin
from .models import GroupChat, PrivateFileMessage

# Register your models here.
admin.site.register(GroupChat)
admin.site.register(PrivateFileMessage)