import json
from channels.db import database_sync_to_async
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import PrivateChat, GroupChat, PrivateTextMessage


class PrivateMessageConsumer(AsyncWebsocketConsumer):
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
    

    async def connect(self):
        self.chat_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.user = self.scope["user"]

        if await self.verify_room():
            self.user_info = await self.get_user_info(self.user)
            await self.channel_layer.group_add(self.chat_name, self.channel_name)
            await self.accept()
        else:
            await self.close()


    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.chat_name, self.channel_name)


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
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


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "user": event["user"],
            "type": "text",
            "id": event["id"],
            "timestamp": event["timestamp"],
        }))