from django.urls import path
from . import views


app_name = "posts"
urlpatterns = [
    path('create_post', views.create_post, name="create_post"),
    path('post/<str:post_id>', views.get_post, name="get_post"),
    path('posts/<str:username>', views.get_profile_posts, name="get_profile_posts"),
    path('post/img/<str:pic_id>', views.get_post_pic, name="get_post_pic"),
    path('post/edit/<str:post_id>', views.edit_post, name="edit_post"),
    path('post/photo/add', views.add_photo, name="add_photo"),
    path('post/photo/delete', views.delete_photo, name="delete_photo"),
    path('delete', views.delete_post, name="delete_post"),
    path('', views.get_home_feed, name="get_home_feed"),

]