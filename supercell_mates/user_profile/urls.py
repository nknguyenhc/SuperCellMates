from django.urls import path
from . import views


app_name = "user_profile"
urlpatterns = [
    path('', views.index, name="index"),
    path('async', views.index_async, name="index_async"),
    path('setup', views.setup, name="setup"),
    path('obtain_tags', views.obtain_tags, name="obtain_tags"),
    path('add_tags', views.add_tags, name="add_tags"),
    path('set_profile_image', views.set_profile_image, name="set_profile_image"),
    path('img/<str:username>', views.get_profile_pic, name="get_profile_pic"),
    path('search_tags', views.search_tags, name="search_tags"),
    path('tag/<str:tag_name>', views.get_tag_icon, name="get_tag_icon"),
]