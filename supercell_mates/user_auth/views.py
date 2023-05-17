from django.shortcuts import render, redirect, reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import UserAuth, Tag, TagRequest
from user_profile.models import UserProfile


def home(request):
    if not request.user.is_authenticated:
        return redirect(reverse("user_auth:login"))
    else:
        return render(request, "user_auth/home.html")

@ensure_csrf_cookie
def home_async(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "not logged in"})
    else:
        return JsonResponse({"message": "logged in"})


def login_async(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({"message": "logged in"})
        else:
            return JsonResponse({"message": "wrong username or password"})


def login_user(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect(reverse("user_auth:home"))
        else:
            return render(request, 'user_auth/login.html', {
                "error_message": "Wrong username or password"
            })
    
    return render(request, "user_auth/login.html")

def check_unique_username_async(request):
    if request.method == "POST":
        username = request.POST["username"]
        if UserAuth.objects.filter(username = username).exists():
            return JsonResponse({"message": "username is already taken"})
        return JsonResponse({"message": "username is unique"})


def register_async(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        name = request.POST["name"]
        if username == '' or password == '': # this only serve as a backup, checking empty fields should be done in front end
            return JsonResponse({"message": "username or password is empty"})

        try:
            user = UserAuth.objects.create_user(username=username, password=password)
            user_profile_obj = UserProfile(name=name, user_auth=user)
            user_profile_obj.save()
            login(request, user)
        except IntegrityError:
            return JsonResponse({"message": "username already taken"})
        
        return JsonResponse({"message": "account created"})


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        name = request.POST["name"]
        if username == '' or password == '' or name == '':
            return render(request, "user_auth/register.html", {
                "error_message": "username/password or name is empty"
            })

        try:
            user = UserAuth.objects.create_user(username=username, password=password)
            user_profile_obj = UserProfile(name=name, user_auth=user)
            user_profile_obj.save()
            login(request, user)
        except IntegrityError:
            return render(request, "user_auth/register.html", {
                "error_message": "username already taken"
            })
        
        return redirect(reverse("user_profile:setup"))

    return render(request, "user_auth/register.html")


def logout_user(request):
    logout(request)
    return redirect(reverse("user_auth:home"))


def logout_async(request):
    logout(request)
    return JsonResponse({"message": "logged out"})


def add_tag_admin(request):
    if request.user.is_superuser:
        if request.method == "POST":
            tag_request_id = request.POST["tag_request_id"]
            TagRequest.objects.get(id=tag_request_id).delete()
            tagName = request.POST["tag"]
            tag = Tag(name=tagName)
            tag.save()
            return JsonResponse({"message": "success"})
        else:
            return render(request, "user_auth/add_tags_admin.html")


def remove_tag_request(request):
    if request.user.is_superuser:
        if request.method == "POST":
            tag_request_id = request.POST["tag_request_id"]
            TagRequest.objects.get(id=tag_request_id).delete()
            return JsonResponse({"message": "success"})


def obtain_tag_requests(request):
    if request.user.is_superuser:
        tag_request_objs = list(TagRequest.objects.all())
        tag_requests = list(map(lambda request_obj:{
            "id": request_obj.id,
            "name": request_obj.name
        }, tag_request_objs))
        return JsonResponse({"tag_requests": tag_requests})


def add_tag(request):
    if request.user.is_authenticated and request.method == "POST":
        tagName = request.POST["tag"]
        tag_request = TagRequest(name=tagName)
        tag_request.save()
        return JsonResponse({"message": "success"})