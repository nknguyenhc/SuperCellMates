from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("ws/message/<str:room_name>/", consumers.PrivateMessageConsumer.as_asgi()),
    path("ws/group/<str:room_name>/", consumers.GroupMessageConsumer.as_asgi()),
]