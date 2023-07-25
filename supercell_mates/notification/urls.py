from django.urls import path
from . import views


app_name = 'notification'
urlpatterns = [
    path('friends', views.friends, name='friends'),
    path('chats_new_messages', views.chats_new_messages, name='chats_new_messages'),
    path('see_message', views.see_message, name="see_message"),
]