from django.urls import path
from . import views


app_name = "user_profile"
urlpatterns = [
    path('', views.index, name="index"),
    path('setup', views.setup, name="setup"),
    path('obtain_tags', views.obtain_tags, name="obtain_tags"),
    path('set_tags', views.set_tags, name="set_tags"),
    path('set_profile_image', views.set_profile_image, name="set_profile_image")
]