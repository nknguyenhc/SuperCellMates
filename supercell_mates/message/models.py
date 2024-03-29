from django.db import models
from posts.models import random_str

"""Chats"""
class AbstractChat(models.Model):
    id = models.CharField(unique=True, primary_key=True, default=random_str, max_length=50)
    timestamp = models.FloatField()

    class Meta:
        abstract = True


class PrivateChat(AbstractChat):
    users = models.ManyToManyField('user_auth.UserAuth', related_name='private_chats')


class GroupChat(AbstractChat):
    name = models.CharField(max_length=15)
    users = models.ManyToManyField('user_auth.UserAuth', related_name='group_chats')
    admins = models.ManyToManyField('user_auth.UserAuth', related_name='admin_chats')
    creator = models.ForeignKey("user_auth.UserAuth", on_delete=models.SET_NULL, null=True, related_name='created_chats')
    rep_img = models.ImageField(null=True)

"""Chat Messages"""
class AbstractMessage(models.Model):
    id = models.CharField(unique=True, primary_key=True, default=random_str, max_length=50)
    timestamp = models.FloatField()

    class Meta:
        abstract = True

# text message
class TextMessage(AbstractMessage):
    text = models.TextField()

    class Meta:
        abstract = True
    

class PrivateTextMessage(TextMessage):
    chat = models.ForeignKey(PrivateChat, on_delete=models.CASCADE, related_name='text_messages')
    user = models.ForeignKey('user_auth.UserAuth', on_delete=models.CASCADE, related_name='private_text_messages')
    seen_users = models.ManyToManyField('user_auth.UserAuth', related_name='seen_private_text_messages')


class ReplyPostMessage(TextMessage):
    chat = models.ForeignKey(PrivateChat, on_delete=models.CASCADE, related_name='reply_post_messages')
    post = models.ForeignKey('posts.Post', on_delete=models.SET_NULL, related_name='replies', null=True)
    user = models.ForeignKey('user_auth.UserAuth', on_delete=models.CASCADE, related_name='reply_post_messages')
    seen_users = models.ManyToManyField('user_auth.UserAuth', related_name='seen_reply_post_messages')


class GroupTextMessage(TextMessage):
    chat = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name='text_messages')
    user = models.ForeignKey('user_auth.UserAuth', on_delete=models.CASCADE, related_name='group_text_messages')
    seen_users = models.ManyToManyField('user_auth.UserAuth', related_name='seen_group_text_messages')

# file message
class FileMessage(AbstractMessage):
    file_field = models.FileField(upload_to='message/')
    file_name = models.CharField(max_length=100)
    is_image = models.BooleanField()

    class Meta:
        abstract = True


class PrivateFileMessage(FileMessage):
    chat = models.ForeignKey(PrivateChat, on_delete=models.CASCADE, related_name='file_messages')
    user = models.ForeignKey('user_auth.UserAuth', on_delete=models.CASCADE, related_name='private_file_messages')
    seen_users = models.ManyToManyField('user_auth.UserAuth', related_name='seen_private_file_messages')


class GroupFileMessage(FileMessage):
    chat = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name='file_messages')
    user = models.ForeignKey('user_auth.UserAuth', on_delete=models.CASCADE, related_name='group_file_messages')
    seen_users = models.ManyToManyField('user_auth.UserAuth', related_name='seen_group_file_messages')