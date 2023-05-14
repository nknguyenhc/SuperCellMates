from django.urls import path
from . import views


app_name = "user_profile"
urlpatterns = [
    path('', views.index, name="index"),
    path('add_tags', views.add_tags, name="add_tags"),
    path('setup', views.setup, name="setup")
]