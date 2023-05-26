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
def view_profile_async(request, username):
    if UserAuth.objects.filter(username=username).exists():
        user_profile_obj = UserAuth.objects.get(username=username).user_profile
        tags = list(user_profile_obj.tagList.all())
        tag_list_string = ""
        for tag in tags:
            tag_list_string += tag.name + ";"
        is_friend = UserAuth.objects.get(username=username).user_log in list(request.user.user_log.friend_list.all())
        return JsonResponse({
            "image_url": reverse("user_profile:get_profile_pic", args=(user_profile_obj.user_auth.username,)),
            "name": user_profile_obj.name,
            "username": user_profile_obj.user_auth.username,
            "tagListString": tag_list_string,
            "my_profile": False,
            "is_friend": is_friend,
        })


@login_required
@require_http_methods(["POST"])
def add_friend_request(request):
    try:
        username = request.POST["username"]
        user_log_obj = UserAuth.objects.get(username=username).user_log
        if user_log_obj not in list(request.user.user_log.friend_list.all()):
            user_log_obj.friend_requests.add(request.user.user_log)
            return HttpResponse("ok")
        else:
            return HttpResponse("already in friend list")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("no username submitted")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("no user with provided username")


def get_friend_list(user):
    return list(map(
        lambda friend: ({
            "username": friend.user_auth.username
        }),
        list(user.user_log.friend_list.all())
    ))


@login_required
def view_friends(request):
    friends = get_friend_list(request.user)
    return render(request, 'user_log/friends.html', {
        "image_url": reverse("user_profile:get_profile_pic", args=(request.user.username,)),
        "user_profile": request.user.user_profile,
        "friends": friends,
        "my_profile": True
    })


@login_required
def view_friends_async(request):
    friends = get_friend_list(request.user)
    return JsonResponse(friends, safe=False)


def get_friend_requests_list(user):
    return list(map(
        lambda friend: ({
            "username": friend.user_auth.username
        }),
        list(user.user_log.friend_requests.all())
    ))


@login_required
def view_friend_requests(request):
    friend_requests = get_friend_requests_list(request.user)
    return render(request, "user_log/friend_requests.html", {
        "image_url": reverse("user_profile:get_profile_pic", args=(request.user.username,)),
        "user_profile": request.user.user_profile,
        "friend_requests": friend_requests,
        "my_profile": True
    })


@login_required
def view_friend_requests_async(request):
    friend_requests = get_friend_requests_list(request.user)
    return JsonResponse(friend_requests, safe=False)


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


# not a view
def find_users(search_param):
    return list(map(
        lambda user: ({
            "name": user.user_profile.name,
            "username": user.username
        }),
        filter(
            lambda user: search_param in user.username,
            list(UserAuth.objects.all())
        )
    ))


@login_required
def search(request):
    search_param = request.GET["username"]
    users = find_users(search_param)
    return render(request, "user_log/search.html", {
        "users": users
    })


@login_required
def search_users_async(request):
    search_param = request.GET["username"]
    users = find_users(search_param)
    return JsonResponse({
        "users": users
    })