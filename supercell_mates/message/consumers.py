from json import loads, dumps, JSONDecodeError
from channels.db import database_sync_to_async
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from abc import ABC, abstractmethod

from .models import PrivateChat, GroupChat, PrivateTextMessage, GroupTextMessage, PrivateFileMessage, GroupFileMessage, ReplyPostMessage
from posts.models import Post
from posts.views import has_access


class AbstractMessageConsumer(ABC, AsyncWebsocketConsumer):
    """Available instance fields:
    user: the UserAuth instance of the current user
    user_info: dictionary containing info of the current user with the following fields:
        name: the name of the user
        username: the username of the user
        profile_link: link to the profile of the user
        profile_img_url: URL to the profile image of the user
    chat_object: the instance of AbstractChat of this chat
    chat_name: the id of the current chat in the database
    channel_layer, channel_name: inherit from AsyncWebsocketConsumer
    """

    @abstractmethod
    def verify_room(self):
        pass
    

    @abstractmethod
    def can_connect(self):
        pass
    

    @database_sync_to_async
    def get_user_info(self, user_auth_obj):
        return {
            "name": user_auth_obj.user_profile.name,
            "username": user_auth_obj.username,
            "profile_link": reverse("user_log:view_profile", args=(user_auth_obj.username,)),
            "profile_img_url": reverse("user_profile:get_profile_pic", args=(user_auth_obj.username,)),
        }
    

    @abstractmethod
    def add_text_message(self, message):
        pass
    

    def parse_text_message(self, text_message):
        text_message.save()
        self.chat_object.timestamp = datetime.now().timestamp()
        self.chat_object.save()
        return (text_message.id, text_message.timestamp)
    

    def parse_reply_post_message(self, reply_post_message):
        reply_post_message.save()
        self.chat_object.timestamp = datetime.now().timestamp()
        self.chat_object.save()
        return (reply_post_message.id, reply_post_message.timestamp, {
            "id": reply_post_message.post.id,
            "title": reply_post_message.post.title,
            "content": reply_post_message.post.content,
        })


    @abstractmethod
    def get_file_message(self, message_id):
        pass
    

    def parse_file_message(self, file_message):
        return {
            "file_name": file_message.file_name,
            "timestamp": file_message.timestamp,
            "is_image": file_message.is_image,
        }
    

    @database_sync_to_async
    def can_reply_post(self, post_id):
        if Post.objects.filter(id=post_id).exists():
            return has_access(self.user, Post.objects.get(id=post_id)) # check if the post belongs to the other user as well
        return False
    

    @abstractmethod
    def add_reply_post(self, message, post_id):
        pass
    

    async def connect(self):
        """Called when a user attempts to connect."""

        self.chat_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.user = self.scope["user"]

        if await self.verify_room():
            self.user_info = await self.get_user_info(self.user)
            await self.channel_layer.group_add(self.chat_name, self.channel_name)
            await self.accept()
            if not await self.can_connect():
                await self.close(code=4003)


    async def disconnect(self, close_code):
        """Called when a user disconnects."""
        await self.channel_layer.group_discard(self.chat_name, self.channel_name)


    async def receive(self, text_data):
        """Called when a user sends data to the channel.
        The corresponding channel layer then call the method with the same name as the value to the "type" field of the event.
        """
        try:
            text_data_json = loads(text_data)
        except JSONDecodeError:
            return

        if "type" in text_data_json.keys():

            if text_data_json["type"] == "text":
                if "message" in text_data_json.keys():
                    message = text_data_json["message"]
                    if len(message) <= 700: # text length limit
                        text_id, timestamp = await self.add_text_message(message)
                        await self.channel_layer.group_send(
                            self.chat_name, {
                                "type": "chat_message", 
                                "message": message,
                                "user": self.user_info,
                                "id": text_id,
                                "timestamp": timestamp,
                            }
                        )
            
            elif text_data_json["type"] == "file":
                if "message_id" in text_data_json.keys():
                    message_id = text_data_json["message_id"]
                    message = await self.get_file_message(message_id)
                    message.update({
                        "id": message_id,
                        "type": "file_message",
                        "user": self.user_info
                    })
                    await self.channel_layer.group_send(self.chat_name, message)
            

            elif text_data_json["type"] == "reply_post":
                if isinstance(self, PrivateMessageConsumer) and "message" in text_data_json.keys() and "post_id" in text_data_json.keys():
                    message = text_data_json["message"]
                    post_id = text_data_json["post_id"]
                    if len(message) <= 700 and await self.can_reply_post(post_id):
                        text_id, timestamp, post = await self.add_reply_post(message, post_id)
                        await self.channel_layer.group_send(
                            self.chat_name, {
                                "type": "reply_post",
                                "message": message,
                                "post": post,
                                "user": self.user_info,
                                "id": text_id,
                                "timestamp": timestamp
                            }
                        )


    async def chat_message(self, event):
        """Called in response to a user sending a message."""
        await self.send(text_data=dumps({
            "message": event["message"],
            "user": event["user"],
            "type": "text",
            "id": event["id"],
            "timestamp": event["timestamp"],
        }))
    

    async def file_message(self, event):
        """Called in response to a user sending a file."""
        await self.send(text_data=dumps({
            "file_name": event["file_name"],
            "user": event["user"],
            "type": "file",
            "id": event["id"],
            "timestamp": event["timestamp"],
            "is_image": event["is_image"]
        }))
    

    async def reply_post(self, event):
        """Called in response to a user sending a post reply."""
        await self.send(text_data=dumps({
            "message": event["message"],
            "user": event["user"],
            "type": "reply_post",
            "id": event["id"],
            "timestamp": event["timestamp"],
            "post": event["post"]
        }))


class PrivateMessageConsumer(AbstractMessageConsumer):
    @database_sync_to_async
    def verify_room(self):
        if not self.user.is_authenticated:
            return False
        
        try:
            self.chat_object = PrivateChat.objects.get(id=self.chat_name)
        except ObjectDoesNotExist:
            return False
        
        return self.chat_object.users.filter(username=self.user.username).exists()
    

    @database_sync_to_async
    def can_connect(self):
        the_other_user = self.chat_object.users.exclude(username=self.user.username).first()
        return the_other_user.user_log.friend_list.filter(user_auth=self.user).exists()
    

    @database_sync_to_async
    def add_text_message(self, message):
        text_message = PrivateTextMessage(timestamp=datetime.now().timestamp(), user=self.user, chat=self.chat_object, text=message)
        return self.parse_text_message(text_message)
    

    @database_sync_to_async
    def get_file_message(self, message_id):
        file_message = PrivateFileMessage.objects.get(id=message_id)
        return self.parse_file_message(file_message)
    

    @database_sync_to_async
    def add_reply_post(self, message, post_id):
        reply_post_message = ReplyPostMessage(timestamp=datetime.now().timestamp(), user=self.user, chat=self.chat_object, text=message, post=Post.objects.get(id=post_id))
        return self.parse_reply_post_message(reply_post_message)


class GroupMessageConsumer(AbstractMessageConsumer):
    @database_sync_to_async
    def verify_room(self):
        if not self.user.is_authenticated:
            return False
        
        try:
            self.chat_object = GroupChat.objects.get(id=self.chat_name)
        except ObjectDoesNotExist:
            return False
        
        return self.chat_object.users.filter(username=self.user.username).exists()
    

    @database_sync_to_async
    def can_connect(self):
        return True


    @database_sync_to_async
    def add_text_message(self, message):
        text_message = GroupTextMessage(timestamp=datetime.now().timestamp(), user=self.user, chat=self.chat_object, text=message)
        return self.parse_text_message(text_message)
    

    @database_sync_to_async
    def get_file_message(self, message_id):
        file_message = GroupFileMessage.objects.get(id=message_id)
        return self.parse_file_message(file_message)