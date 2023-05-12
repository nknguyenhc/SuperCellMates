from django.urls import path
from . import views


app_name = "user_auth"
urlpatterns = [
    path('', views.home, name="home"),
    path('login', views.login_user, name="login"),
    path('register', views.register, name="register")
]