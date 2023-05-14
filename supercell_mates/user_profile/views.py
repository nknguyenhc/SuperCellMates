from django.shortcuts import render
from django.http import JsonResponse
from json import loads
from .models import UserProfile


def index(request):
    if request.user.is_authenticated:
        user_profile_obj = UserProfile.objects.get(user_auth=request.user)
        return render(request, 'user_profile/index.html', {
            "user_profile": user_profile_obj
        })


def add_tags(request):
    if request.method == "POST" and request.user.is_authenticated:
        user_profile_obj = UserProfile.objects.filter(user_auth=request.user).get()
        data = loads(request.body.decode('utf-8'))
        count = data["count"]
        for i in range(count):
            if user_profile_obj.tagList == "":
                user_profile_obj.tagList = data["tags"][str(i)]
            else:
                user_profile_obj.tagList += "," + data["tags"][str(i)]
        user_profile_obj.save()
        return JsonResponse({"message": "success"})


def setup(request):
    if request.method == "POST" and request.user.is_authenticated:
        data = loads(request.body.decode('utf-8'))
        user_profile_obj = UserProfile.objects.filter(user_auth=request.user).get()
        count = data["count"]
        for i in range(count):
            if user_profile_obj.tagList == "":
                user_profile.obj.tagList = data["tags"][str(i)]
            else:
                user_profile_obj.tagList += "," + data["tags"][str(i)]
        user_profile_obj.save()
        return JsonResponse({"message": "success"})
    return render(request, "user_profile/setup.html")
            