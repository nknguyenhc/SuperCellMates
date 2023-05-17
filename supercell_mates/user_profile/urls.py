from django.urls import path
from . import views


app_name = "user_profile"
urlpatterns = [
    path('', views.index, name="index"),
    path('async', views.index_async, name="index_async"),
    path('setup', views.setup, name="setup"),
    path('obtain_tags', views.obtain_tags, name="obtain_tags"),
    path('add_tags', views.add_tags, name="add_tags"),
    path('set_profile_image', views.set_profile_image, name="set_profile_image")
]