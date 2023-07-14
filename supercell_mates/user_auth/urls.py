from django.urls import path
from . import views


app_name = "user_auth"
urlpatterns = [
    path('', views.home, name="home"),
    path('async', views.home_async, name="home_async"),
    path('login/', views.login_user, name="login"),
    path('login_async', views.login_async, name="login_async"),
    path('register', views.register, name="register"),
    path('register_async', views.register_async, name="register_async"),
    path('check_unique_username_async', views.check_unique_username_async, name="check_unique_username_async"),
    path('logout', views.logout_user, name="logout"),
    path('logout_async', views.logout_async, name="logout_async"),
    path('add_tag_admin', views.add_tag_admin, name="add_tag_admin"),
    path('remove_tag_request', views.remove_tag_request, name="remove_tag_request"),
    path('add_tag_request', views.add_tag_request, name="add_tag_request"),
    path('obtain_tag_requests', views.obtain_tag_requests, name="obtain_tag_requests"),
    path('manage_page', views.admin, name="admin"),
    path('new_tag_admin', views.new_tag_admin, name="new_tag_admin"),
    path('tag_request/<str:tag_id>', views.get_tag_request_icon, name="get_tag_request_icon"),
    path('about', views.about, name="about"),
    path('settings', views.settings, name="settings"),
    path('change_username', views.change_username, name="change_username"),
    path('change_password', views.change_password, name="change_password"),
    path('documentation', views.documentation, name='documentation'),
    path('testing', views.testing, name='testing'),
    path('apply_admin', views.admin_application, name='admin_application'),
    path('manage_admin', views.manage_admin, name='manage_admin'),
    path('get_admin_requests', views.get_admin_requests, name='get_admin_requests'),
    path('get_admins', views.get_admins, name='get_admins'),
    path('add_admin', views.add_admin, name='add_admin'),
    path('remove_admin', views.remove_admin, name='remove_admin'),
]