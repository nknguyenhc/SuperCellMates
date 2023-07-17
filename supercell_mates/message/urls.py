from django.urls import path
from . import views


app_name = 'message'
urlpatterns = [
    path('', views.index, name='index'),
    path('create_group_chat', views.create_group_chat, name='create_group_chat'),
    path('get_members', views.get_members, name='get_members'),
    path('is_admin', views.is_admin, name='check_admin'),
    path('is_creator', views.is_creator, name='check_creator'),
    path('get_admins', views.get_admins, name='get_admins'),
    path('add_member', views.add_member, name='add_member'),
    path('remove_user', views.remove_user, name='remove_user'),
    path('add_admin', views.add_admin, name='add_admin'),
    path('remove_admin', views.remove_admin, name='remove_admin'),
    path('assign_leader', views.assign_leader, name='assign_leader'),
    path('get_group_chat_rep_img/<str:chat_id>', views.get_group_chat_rep_img, name='get_group_chat_rep_img'),
    path('get_chat_id', views.get_chat_id, name='get_chat_id'),
    path('get_group_chats', views.get_group_chats, name='get_group_chats'),
    path('get_private_chats', views.get_private_chats, name='get_private_chats'),
    path('get_group_messages/<str:chat_id>', views.get_group_messages, name='get_group_messages'),
    path('get_private_messages/<str:chat_id>', views.get_private_messages, name='get_private_messages'),
    path('upload_file', views.upload_file, name='upload_file'),
    path('image/<str:message_id>', views.get_image, name='get_image'),
    path('get_private_chat_id/<str:username>', views.get_private_chat_id, name='get_private_chat_id'),
]