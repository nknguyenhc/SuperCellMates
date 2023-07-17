from django.contrib import admin
from .models import GroupChat, PrivateFileMessage, PrivateTextMessage, ReplyPostMessage

# Register your models here.
admin.site.register(GroupChat)
admin.site.register(PrivateFileMessage)
admin.site.register(PrivateTextMessage)
admin.site.register(ReplyPostMessage)