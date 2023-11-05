from django.urls import path
from . import views


app_name="user_log"
urlpatterns = [
    path('profile/<str:username>', views.view_profile, name="view_profile"),
    path('profile_async/<str:username>', views.view_profile_async, name="view_profile_async"),
    path('privilege', views.profile_privilege, name="profile_privilege"),
    path('set_profile_privacy', views.set_profile_privacy, name='set_profile_privacy'),
    path('add_friend_request', views.add_friend_request, name="add_friend_request"),
    path('friends', views.view_friends, name="view_friends"),
    path('friends_async', views.view_friends_async, name="view_friends_async"),
    path('friend_requests', views.view_friend_requests, name="view_friend_requests"),
    path('friend_requests_async', views.view_friend_requests_async, name="view_friend_requests_async"),
    path('add_friend', views.add_friend, name="add_friend"),
    path('search', views.search, name="search"),
    path('search_username', views.search_username, name="search_username"),
    path('search_friend', views.search_friend, name='search_friend'),
    path('search_friend_username', views.search_friend_username, name='search_friend_username'),
    path('delete_friend', views.delete_friend, name="delete_friend"),
    path('get_badges', views.get_badges, name='get_badges'),
]
