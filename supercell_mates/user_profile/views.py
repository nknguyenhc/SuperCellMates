from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse, HttpResponseNotAllowed
from django.utils.datastructures import MultiValueDictKeyError
from django.contrib.auth.decorators import login_required
from .models import UserProfile
from user_auth.models import UserAuth, Tag
import io
from django.core.files.images import ImageFile


@login_required
def index(request):
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

@login_required
def add_tags(request):
    if request.method == "POST":
        try:
            user_profile_obj = request.user.user_profile
            count = request.POST["count"]
            requested_tags = request.POST["tags"].strip("[]").split(", ")
            for i in range(int(count)):
                user_profile_obj.tagList.add(Tag.objects.get(id=requested_tags[i]))
            return HttpResponse("success")
        except AttributeError:
            return HttpResponseBadRequest("request does not contain form data")
        except MultiValueDictKeyError:
            return HttpResponseBadRequest("request body is missing an important key")
        except ValueError:
            return HttpResponseBadRequest("tags value is not in proper list format")
    else:
        return HttpResponseNotAllowed(["POST"])


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
def set_profile_image(request):
    if request.method == "POST":
        try:
            user_profile_obj = request.user.user_profile
            print(request.FILES)
            img = request.FILES["img"]
            print(img)
            user_profile_obj.profile_pic = img
            user_profile_obj.save()
            return HttpResponse("success")
        except AttributeError:
            return HttpResponseBadRequest("request does not contain form data/image file")
        except MultiValueDictKeyError:
            return HttpResponseBadRequest("request body is missing an important key")
    else:
        return HttpResponseNotAllowed(["POST"])
