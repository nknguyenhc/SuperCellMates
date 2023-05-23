from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.http.response import FileResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.contrib.auth.decorators import login_required
from .models import UserProfile
from user_auth.models import UserAuth, Tag
import io
from django.core.files.images import ImageFile
from django.views.decorators.http import require_http_methods


@login_required
def index(request):
    user_profile_obj = UserProfile.objects.get(user_auth=request.user)
    tags = list(user_profile_obj.tagList.all())
    return render(request, 'user_profile/index.html', {
        "image_url": reverse("user_profile:get_profile_pic", args=(request.user.username,)),
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
            "image_url": reverse("user_profile:get_profile_pic", args=(request.user.username,)),
            "name": user_profile_obj.name,
            "username": user_profile_obj.user_auth.username,
            "tags": tags,
            "tagListString": tagListString,
            "is_admin": request.user.is_superuser,
        }
        return JsonResponse(response)


@login_required
@require_http_methods(["POST"])
def add_tags(request):
    try:
        user_profile_obj = request.user.user_profile
        count = request.POST["count"]
        requested_tags = request.POST["tags"].strip("[]").split(",")
        for i in range(int(count)):
            user_profile_obj.tagList.add(Tag.objects.get(id=requested_tags[i]))
        return HttpResponse("success")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ValueError:
        return HttpResponseBadRequest("tags value is not in proper list format")


@login_required
def setup(request):
    return render(request, "user_profile/setup.html")


@login_required
def obtain_tags(request):
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


@login_required
@require_http_methods(["POST"])
def set_profile_image(request):
    try:
        user_profile_obj = request.user.user_profile
        if "img" in request.POST:
            img_bytearray = request.POST["img"].strip("[]").split(", ")
            img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
            img = ImageFile(io.BytesIO(img_bytearray), name='foo.jpg')
        else:
            img = request.FILES["img"]
        # TODO: check if the file submitted is of correct format
        user_profile_obj.profile_pic = img
        user_profile_obj.save()
        return HttpResponse("success")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data/image file")
    except MultiValueDictKeyError:
        return HttpResponse("image not submitted")


@login_required
def get_profile_pic(request, username):
    if not UserAuth.objects.filter(username=username).exists():
        return HttpResponseBadRequest("username not found")
    else:
        profile_pic = UserAuth.objects.get(username=username).user_profile.profile_pic
        print(profile_pic)
        if not profile_pic:
            return redirect('/static/media/default_profile_pic.jpg')
        else:
            return FileResponse(profile_pic)
