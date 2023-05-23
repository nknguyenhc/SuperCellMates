from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse, HttpResponseNotAllowed
from django.http.response import FileResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.contrib.auth.decorators import login_required
from .models import UserProfile
from user_auth.models import UserAuth, Tag


@login_required
def index(request):
    user_profile_obj = UserProfile.objects.get(user_auth=request.user)
    tags = list(user_profile_obj.tagList.all())
    return render(request, 'user_profile/index.html', {
        "image_url": reverse("user_profile:get_profile_pic", args=(request.user.username,)),
        "user_profile": user_profile_obj,
        "tags": tags
    })


@login_required
def add_tags(request):
    if request.method == "POST":
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
            img = request.FILES["img"]
            # TODO: check if the file submitted is of correct format
            user_profile_obj.profile_pic = img
            user_profile_obj.save()
            return HttpResponse("success")
        except AttributeError:
            return HttpResponseBadRequest("request does not contain form data/image file")
        except MultiValueDictKeyError:
            return HttpResponse("image not submitted")
    else:
        return HttpResponseNotAllowed(["POST"])


@login_required
def get_profile_pic(request, username):
    if not UserAuth.objects.filter(username=username).exists():
        return HttpResponseBadRequest("username not found")
    else:
        return FileResponse(UserAuth.objects.get(username=username).user_profile.profile_pic)