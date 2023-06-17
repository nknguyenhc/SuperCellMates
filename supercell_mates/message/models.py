from django.db import models
from posts.models import random_str


class AbstractChat(models.Model):
    id = models.CharField(unique=True, primary_key=True, default=random_str, max_length=50)
    timestamp = models.DateTimeField()

    class Meta:
        abstract = True


class PrivateChat(AbstractChat):
    users = models.ManyToManyField('user_auth.UserAuth', related_name='private_chats')


class GroupChat(AbstractChat):
    users = models.ManyToManyField('user_auth.UserAuth', related_name='group_chats')
    rep_img = models.ImageField(null=True)


class AbstractMessage(models.Model):
    id = models.CharField(unique=True, primary_key=True, default=random_str, max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class TextMessage(AbstractMessage):
    text = models.TextField()

    class Meta:
        abstract = True
    

class PrivateTextMessage(TextMessage):
    chat = models.ForeignKey(PrivateChat, on_delete=models.CASCADE, related_name='text_messages')
    user = models.ForeignKey('user_auth.UserAuth', on_delete=models.CASCADE, related_name='private_text_messages')


class GroupTextMessage(TextMessage):
    chat = models.ForeignKey(GroupChat, on_delete=models.CASCADE, related_name='text_messages')
    user = models.ForeignKey('user_auth.UserAuth', on_delete=models.CASCADE, related_name='group_text_messages')