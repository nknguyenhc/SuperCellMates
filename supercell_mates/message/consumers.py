from json import loads, dumps, JSONDecodeError
from channels.db import database_sync_to_async
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import PrivateChat, GroupChat, PrivateTextMessage, PrivateFileMessage


class PrivateMessageConsumer(AsyncWebsocketConsumer):
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
    def get_user_info(self, user_auth_obj):
        return {
            "name": user_auth_obj.user_profile.name,
            "username": user_auth_obj.username,
            "profile_link": reverse("user_log:view_profile", args=(user_auth_obj.username,)),
            "profile_img_url": reverse("user_profile:get_profile_pic", args=(user_auth_obj.username,)),
        }
    

    @database_sync_to_async
    def add_text_message(self, message):
        text_message = PrivateTextMessage(user=self.user, chat=self.chat_object, text=message)
        text_message.save()
        return (text_message.id, text_message.timestamp.timestamp())
    

    @database_sync_to_async
    def get_file_message(self, message_id):
        file_message = PrivateFileMessage.objects.get(id=message_id)
        return {
            "file_name": file_message.file_name,
            "timestamp": file_message.timestamp.timestamp(),
            "is_image": file_message.is_image,
        }
    

    async def connect(self):
        """Called when a user attempts to connect."""

        self.chat_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.user = self.scope["user"]

        if await self.verify_room():
            self.user_info = await self.get_user_info(self.user)
            await self.channel_layer.group_add(self.chat_name, self.channel_name)
            await self.accept()
        else:
            await self.close()


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
            pass

        if text_data_json["type"] == "text":
            if "message" in text_data_json.keys():
                message = text_data_json["message"]
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