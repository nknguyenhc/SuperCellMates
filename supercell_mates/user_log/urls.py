from django.urls import path
from . import views


app_name="user_log"
urlpatterns = [
    path('profile/<str:username>', views.view_profile, name="view_profile"),
    path('profile_async/<str:username>', views.view_profile_async, name="view_profile_async"),
    path('add_friend', views.add_friend, name="add_friend"),
    path('friends', views.view_friends, name="view_friends"),
    path('friends_async', views.view_friends_async, name="view_friends_async"),
    path('friend_requests', views.view_friend_requests, name="view_friend_requests"),
    path('friend_requests_async', views.view_friend_requests_async, name="view_friend_requests_async"),
    path('add_friend', views.add_friend, name="add_friend"),
]