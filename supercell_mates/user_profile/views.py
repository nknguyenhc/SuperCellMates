from django.shortcuts import render
from django.http import JsonResponse
from .models import UserProfile
from user_auth.models import UserAuth, Tag
import io
from django.core.files.images import ImageFile


def index(request):
    if request.user.is_authenticated:
        user_profile_obj = UserProfile.objects.get(user_auth=request.user)
        tags = list(user_profile_obj.tagList.all())
        return render(request, 'user_profile/index.html', {
            "image_url": user_profile_obj.profile_pic.url,
            "user_profile": user_profile_obj,
            "tags": tags
        })

def index_async(request):
    if request.user.is_authenticated:
        user_profile_obj = UserProfile.objects.get(user_auth=request.user)
        tags = list(user_profile_obj.tagList.all())
        tagListString = ""
        for tag in tags:
            tagListString += tag.name + ";"

        response = {
            "image_url": user_profile_obj.profile_pic.url,
            "name": user_profile_obj.name,
            "username": user_profile_obj.user_auth.username,
            "tagListString": tagListString,
            "is_admin": request.user.is_superuser,
        }
        return JsonResponse(response)


def add_tags(request):
    if request.method == "POST" and request.user.is_authenticated:
        user_profile_obj = request.user.user_profile
        curr_count = user_profile_obj.tagList.count
        new_tags_list = request.POST["tags"].strip("[]").split(",")
        print(new_tags_list)
        new_count = len(new_tags_list)
        # TODO: check if limit is reached
        for i in range(new_count):
            user_profile_obj.tagList.add(Tag.objects.get(id=int(new_tags_list[i])))
        return JsonResponse({"message": "success"})


def setup(request):
    return render(request, "user_profile/setup.html")
    

def obtain_tags(request):
    if request.user.is_authenticated:
        user_profile = request.user.user_profile
        tagList = set(user_profile.tagList.all())
        tags = list(Tag.objects.all())
        tags = list(map(lambda tag: {
            "tag_id": tag.id,
            "tag_name": tag.name,
            "in": tag in tagList
        }, tags))
        return JsonResponse({
            "tags": tags
        })


def set_profile_image(request):
    if request.method == "POST" and request.user.is_authenticated:
        user_profile_obj = request.user.user_profile
        if "img" in request.POST:
            img_bytearray = request.POST["img"].strip("[]").split(", ")
            img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
            img = ImageFile(io.BytesIO(img_bytearray), name='foo.jpg')
        else:
            img = request.FILES["img"]
        user_profile_obj.profile_pic = img
        user_profile_obj.save()
        return JsonResponse({"message": "success"})