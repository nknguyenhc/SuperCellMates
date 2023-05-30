from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist
from user_profile.views import layout_context

from user_auth.models import UserAuth


def view_profile_context(user_auth_obj, request_user):
    tags = list(map(
        lambda tag: ({
            "name": tag.name
        }),
        list(user_auth_obj.user_profile.tagList.all())
    ))
    result = {
        "tags": tags,
        "my_profile": False,
        "is_friend": user_auth_obj.user_log in list(request_user.user_log.friend_list.all())
    }
    result.update(layout_context(user_auth_obj))
    return result


@login_required
def view_profile(request, username):
    if UserAuth.objects.filter(username=username).exists() and request.user.username != username:
        return render(request, "user_log/view_profile.html", view_profile_context(UserAuth.objects.get(username=username), request.user))
    else:
        return HttpResponseNotFound()


@login_required
def view_profile_async(request, username):
    if UserAuth.objects.filter(username=username).exists() and request.user.username != username:
        return JsonResponse(view_profile_context(UserAuth.objects.get(username=username), request.user))
    else:
        return HttpResponseNotFound()


@login_required
@require_http_methods(["POST"])
def add_friend_request(request):
    try:
        username = request.POST["username"]
        user_log_obj = UserAuth.objects.get(username=username).user_log
        if user_log_obj not in request.user.user_log.friend_list.all():
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
            "username": friend.user_auth.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(friend.user_auth.username,)),
            "profile_link": reverse("user_log:view_profile", args=(friend.user_auth.username,)),
        }),
        list(user.user_log.friend_list.all())
    ))


@login_required
def view_friends(request):
    friends = get_friend_list(request.user)
    context = {
        "friends": friends,
        "my_profile": True
    }
    context.update(layout_context(request.user))
    return render(request, 'user_log/friends.html', context)


@login_required
def view_friends_async(request):
    friends = get_friend_list(request.user)
    return JsonResponse(friends, safe=False)


def get_friend_requests_list(user):
    return list(map(
        lambda friend: ({
            "username": friend.user_auth.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(friend.user_auth.username,)),
            "profile_link": reverse("user_log:view_profile", args=(friend.user_auth.username,))
        }),
        list(user.user_log.friend_requests.all())
    ))


@login_required
def view_friend_requests(request):
    friend_requests = get_friend_requests_list(request.user)
    context = {
        "friend_requests": friend_requests,
        "my_profile": True
    }
    context.update(layout_context(request.user))
    return render(request, "user_log/friend_requests.html", context)


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


def find_users(search_param, my_username):
    return list(map(
        lambda user: ({
            "name": user.user_profile.name,
            "username": user.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(user.username,)),
            "profile_link": reverse("user_log:view_profile", args=(user.username,)),
        }),
        filter(
            lambda user: search_param in user.username and user.username != my_username,
            list(UserAuth.objects.all())
        )
    ))


@login_required
def search(request):
    search_param = request.GET["username"]
    users = find_users(search_param, request.user.username)
    return JsonResponse({
        "users": users
    })