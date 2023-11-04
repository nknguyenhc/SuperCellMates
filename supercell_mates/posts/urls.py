from django.urls import path
from . import views


app_name = "posts"
urlpatterns = [
    path('create_post', views.create_post, name="create_post"),
    path('post/<str:post_id>', views.get_post, name="get_post"),
    path('display', views.display_post, name="display_post"),
    path('posts/<str:username>', views.get_profile_posts, name="get_profile_posts"),
    path('post/img/<str:pic_id>', views.get_post_pic, name="get_post_pic"),
    path('post/edit/<str:post_id>', views.edit_post, name="edit_post"),
    path('delete', views.delete_post, name="delete_post"),
    path('count', views.total_num_of_posts, name="post_count"),
    path('frequencies', views.post_frequencies, name="post_frequencies"),
    path('', views.get_home_feed, name="get_home_feed"),

]