from django.urls import path
from . import views


app_name = "user_auth"
urlpatterns = [
    path('', views.home, name="home"),
    path('async', views.home_async, name="home_async"),
    path('login', views.login_user, name="login"),
    path('login_async', views.login_async, name="login_async"),
    path('register', views.register, name="register"),
    path('register_async', views.register_async, name="register_async"),
    path('check_unique_username_async', views.check_unique_username_async, name="check_unique_username_async"),
    path('logout', views.logout_user, name="logout"),
    path('logout_async', views.logout_async, name="logout_async"),
    path('add_tag_admin', views.add_tag_admin, name="add_tag_admin"),
    path('remove_tag_request', views.remove_tag_request, name="remove_tag_request"),
    path('add_tag', views.add_tag, name="add_tag"),
    path('obtain_tag_requests', views.obtain_tag_requests, name="obtain_tag_requests")
]