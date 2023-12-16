from django.urls import path
from . import views


app_name = "user_profile"
urlpatterns = [
    path('', views.index, name="index"),
    path('async', views.index_async, name="index_async"),
    path('setup', views.setup, name="setup"),
    path('privacy', views.get_privacy_settings, name='get_privacy_settings'),
    path('obtain_tags', views.obtain_tags, name="obtain_tags"),
    path('add_tags', views.add_tags, name="add_tags"),
    path('set_profile_image', views.set_profile_image, name="set_profile_image"),
    path('img/<str:username>', views.get_profile_pic, name="get_profile_pic"),
    path('search_tags', views.search_tags, name="search_tags"),
    path('tag/<str:tag_id>', views.get_tag_icon, name="get_tag_icon"),
    path('user_tags/<str:username>', views.get_user_tags, name="get_user_tags"),
    path('change_name', views.change_name, name="change_name"),
    path('can_remove_tag', views.can_remove_tag, name="can_remove_tag"),
    path('remove_tag', views.remove_tag, name="remove_tag"),
    path('achievements/<str:username>', views.achievements, name="achievements"),
    path('readme/<str:username>', views.readme, name="readme"),
    path('edit_readme', views.edit_readme, name="edit_readme"),
]