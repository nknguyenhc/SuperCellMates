from django.shortcuts import render
from django.urls import reverse
from user_auth.models import UserAuth
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist

from user_auth.models import UserAuth


@login_required
def view_profile(request, username):
    if UserAuth.objects.filter(username=username).exists():
        user_profile_obj = UserAuth.objects.get(username=username).user_profile
        tags = list(user_profile_obj.tagList.all())
        return render(request, "user_profile/index.html", {
            "image_url": reverse("user_profile:get_profile_pic", args=(user_profile_obj.user_auth.username,)),
            "user_profile": user_profile_obj,
            "tags": tags,
            "my_profile": False
        })


@login_required
@require_http_methods(["POST"])
def add_friend(request):
    try:
        username = request.POST["username"]
        user_log_obj = UserAuth.objects.get(username=username).user_log
        user_log_obj.friend_requests.add(request.user.user_log)
        return HttpResponse("ok")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("no username submitted")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("no user with provided username")


@login_required
def view_friends(request):
    friends = list(map(
        lambda user:({
            "username": user.user_auth.username
        }),
        list(request.user.user_log.friend_list.all())
    ))
    return render(request, 'user_log/friends.html', {
        "image_url": reverse("user_profile:get_profile_pic", args=(request.user.username,)),
        "user_profile": request.user.user_profile,
        "friends": friends,
        "my_profile": True
    })


@login_required
def view_friend_requests(request):
    friend_requests = list(map(
        lambda user:({
            "username": user.user_auth.username
        }),
        list(request.user.user_log.friend_requests.all())
    ))
    return render(request, "user_log/friend_requests.html", {
        "image_url": reverse("user_profile:get_profile_pic", args=(request.user.username,)),
        "user_profile": request.user.user_profile,
        "friend_requests": friend_requests,
        "my_profile": True
    })


@login_required
@require_http_methods(["POST"])
def add_friend(request):
    try:
        friend_username = request.POST["username"]
        user_log_obj = UserAuth.objects.get(username=friend_username).user_log
        accepted = request.POST["accepted"]
        request.user.user_log.friend_requests.remove(user_log_obj)
        if accepted == "true":
            request.user.user_log.friend_list.add(user_log_obj)
        return HttpResponse("ok")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request does not have an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("user with the requested username does not exist")