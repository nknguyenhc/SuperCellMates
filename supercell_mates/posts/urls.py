from django.urls import path
from . import views


app_name = "posts"
urlpatterns = [
    path('create_post', views.create_post, name="create_post"),
    path('post/<str:post_id>', views.get_post, name="get_post"),
]