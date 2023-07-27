from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from user_profile.views import layout_context, get_tag_activity_record, compute_tag_activity_final_score

from user_auth.models import UserAuth
from .models import FriendRequest
from message.models import PrivateChat
from notification.models import FriendNotification


def view_profile_context(user_auth_obj, request_user):
    """Returns the context to be used when rendering template to view another user's profile

    Args:
        user_auth_obj (UserAuth): the UserAuth instance of the user whose info is to be rendered on the template
        request_user (UserAuth): the UserAuth instance of the user that made the request for this template

    Returns:
        dict: the context to be used for template rendering of another user's profile page
        The returned dictionary contains the following fields:
            image_url: the url to the profile image of the target user
            user_profile: a dictionary with fields
                name: the name of the target user
                username: the username of the target user
            tags: the list of tags of the target user, each with the following fields:
                name: the name of the tag
                icon: the URL to the icon of the tag
            my_profile: whether the target user is the same as the user that made the request, False by default
            is_friend: whether the target user is friend with the request user
    """

    tags = list(map(
        lambda tag: ({
            "name": tag.name,
            "icon": reverse('user_profile:get_tag_icon', args=(tag.id,)),
        }),
        list(user_auth_obj.user_profile.tagList.all())
    ))
    result = {
        "tags": tags,
        "my_profile": False,
        "is_friend": user_auth_obj.user_log in request_user.user_log.friend_list.all(),
        "is_friend_request_sent": FriendRequest.objects.filter(to_user=request_user.user_log, from_user=user_auth_obj.user_log).exists()
    }
    result.update(layout_context(user_auth_obj))
    return result


@login_required
def view_profile(request, username):
    """Returns the template to view another user.
    The target user whose info is to be rendered on the template must be indicated in the URL to this view.
    If the user with the username does not exist, HttpResponseNotFound is returned

    Args:
        request (HttpRequest): the request made to this view
        username (str): the username of the target user
    
    Returns:
        HttpResponse: the response with the template to view the target user
    """

    if UserAuth.objects.filter(username=username).exists() and request.user.username != username:
        return render(request, "user_log/view_profile.html", view_profile_context(UserAuth.objects.get(username=username), request.user))
    elif request.user.username == username:
        return redirect(reverse("user_profile:index"))
    else:
        return HttpResponseNotFound()


@login_required
def view_profile_async(request, username):
    """Returns information on the target user to be viewed on mobile

    Args:
        request (HttpRequest): the request made to this view
        username (str): the username of the target user
    
    Returns:
        JsonResponse/HttpResponseNotFound: the information of the target user, or response of status code 404 if no user with the username is found.
        The fields in the JsonResponse are the same fields as those in the dictionary returned by view_profile_context function in this app.
    """

    if UserAuth.objects.filter(username=username).exists() and request.user.username != username:
        return JsonResponse(view_profile_context(UserAuth.objects.get(username=username), request.user))
    else:
        return HttpResponseNotFound()


@login_required
@require_http_methods(["POST"])
def add_friend_request(request):
    """Add friend with the target user.
    Request must use post method, body must contain form data and must contain the following fields:
        username: the username of the target user
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the response containing the feedback of the result.
        If adding friend was successful, status code is 200.
        Otherwise, status code is 400, with explanation given in the text of the response.
    """
    
    try:
        username = request.POST["username"]
        if username == request.user.username:
            return HttpResponseBadRequest("cannot send friend request to yourself")
        user_log_obj = UserAuth.objects.get(username=username).user_log
        is_friend = user_log_obj in request.user.user_log.friend_list.all()
        friend_request_sent = FriendRequest.objects.filter(from_user=request.user.user_log, to_user=user_log_obj).exists() or FriendRequest.objects.filter(to_user=request.user.user_log, from_user=user_log_obj).exists()
        if not is_friend and not friend_request_sent:
            friend_request = FriendRequest(from_user=request.user.user_log, to_user=user_log_obj)
            friend_request.save()
            return HttpResponse("ok")
        elif friend_request_sent:
            return HttpResponse("ok")
        else:
            return HttpResponseBadRequest("already in friend list")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("no username submitted")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("no user with provided username")


def get_friend_list(user):
    """Returns the list of friends of the given user.

    Args:
        user (UserAuth): the UserAuth instance of the user
    
    Returns:
        list(dict): the list of friends, each represented by a dictionary.
        Each dictionary representing a friend has the following fields:
            username: the username of the friend
            profile_pic_url: the URL to the profile picture of the friend
            profile_link: the URL to the profile page of the friend
    """

    result = list(map(
        lambda friend: ({
            "name": friend.user_profile.name,
            "username": friend.user_auth.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(friend.user_auth.username,)),
            "profile_link": reverse("user_log:view_profile", args=(friend.user_auth.username,)),
        }),
        list(user.user_log.friend_list.all())
    ))
    result.sort(key=lambda friend: friend["name"])
    return result


# may be obsolete
@login_required
def view_friends(request):
    friends = get_friend_list(request.user)
    context = {
        "friends": friends,
        "my_profile": True
    }
    context.update(layout_context(request.user))
    return render(request, 'user_log/friends.html', context)


# may change
@login_required
def view_friends_async(request):
    friends = get_friend_list(request.user)
    return JsonResponse(friends, safe=False)


def get_friend_requests_list(user):
    """Returns the friend requests to the current user (request user).

    Args:
        user (UserAuth): the UserAuth instance of the current user (request user)
    
    Returns:
        list(dict): the list of friends, each represented by a dictionary.
        Each dictionary representing a friend has the following fields:
            username: the username of the friend
            profile_pic_url: the URL of the profile image of the friend
            profile_link: the URL to the profile page of the friend
    """

    return list(map(
        lambda friend: ({
            "name": friend.user_profile.name,
            "username": friend.user_auth.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(friend.user_auth.username,)),
            "profile_link": reverse("user_log:view_profile", args=(friend.user_auth.username,))
        }),
        map(
            lambda friend_request_obj: friend_request_obj.from_user,
            list(user.user_log.friend_requests.all())
        )
    ))


# may be obsolete
@login_required
def view_friend_requests(request):
    friend_requests = get_friend_requests_list(request.user)
    context = {
        "friend_requests": friend_requests,
        "my_profile": True
    }
    context.update(layout_context(request.user))
    return render(request, "user_log/friend_requests.html", context)


# may change
@login_required
def view_friend_requests_async(request):
    friend_requests = get_friend_requests_list(request.user)
    return JsonResponse(friend_requests, safe=False)


@login_required
@require_http_methods(["POST"])
def add_friend(request):
    """Add friend with/Reject friend request from the target user.
    The request must use post method, the body must contain form data and must contain the following fields:
        username: the username of the target user
        accepted: whether the current user accepts the friend request from the target user
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the result. If the process is successful, response status is 200.
        Otherwise, response status is 400, with text describing the error.
    """

    try:
        friend_username = request.POST["username"]
        user_log_obj = UserAuth.objects.get(username=friend_username).user_log
        accepted = request.POST["accepted"]
        if request.user.user_log.friend_requests.filter(from_user=user_log_obj).exists():
            request.user.user_log.friend_requests.get(from_user=user_log_obj).delete()
            if accepted == "true":
                request.user.user_log.friend_list.add(user_log_obj)
                friend_notification = FriendNotification(from_user=request.user.user_log, to_user=user_log_obj)
                friend_notification.save()
                if not request.user.private_chats.filter(users=request.user).filter(users=user_log_obj.user_auth).exists():
                    new_chat = PrivateChat(timestamp=datetime.now().timestamp())
                    new_chat.save()
                    new_chat.users.add(request.user)
                    new_chat.users.add(user_log_obj.user_auth)
                    new_chat.save()
            return HttpResponse("ok")
        else:
            return HttpResponseBadRequest("the user with provided username did not send a friend request to you")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request does not have an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("user with the requested username does not exist")


def find_users(search_param, my_username, by_username_only):
    """Return the list of users with the search parameter excluding the user with my_username.
    Match is based on whether the username or name of each user contains the search parameter.

    Args:
        search_param (str): the search parameter
        my_username (str): the username of the user to be excluded from search results
        by_username_only (bool): if True, users will only be matched if their username contains the search parameter
    
    Returns:
        list(dict): a list of users that matches the search conditions, each represented by a dictionary.
        Each dictionary representing a user has the following fields:
            name: the name of the user
            username: the username of the user
            profile_pic_url: the URL to the profile picture of the user
            profile_link: the URL to the profile page of the user
    """
    search_param = search_param.lower()
    my_username = my_username.lower()

    result = list(map(
        lambda user: ({
            "name": user.user_profile.name,
            "username": user.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(user.username,)),
            "profile_link": reverse("user_log:view_profile", args=(user.username,)),
        }),
        filter(
            lambda user: (search_param in user.username.lower() or (search_param in user.user_profile.name.lower() if not by_username_only else False)) and user.username != my_username,
            list(UserAuth.objects.all())
        )
    ))
    result.sort(key=lambda user: user["name"].lower())
    return result


@login_required
def search(request):
    """Return the json response with the results of the search.
    The request must contain GET parameter of "username", which is the search parameter.
    The search returns users whose usernames or names contain the search parameter.
    The returned json contains the following fields:
        users: the list of users returned by find_users method above, with excluded user being the current user
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        JsonResponse/HttpResponse: the result of the search. JsonResponse is used if the search was successful,
        otherwise HttpResponse of error status 400 is returned with text as explanation for error,
        if the request was not configured properly.
    """

    try:
        search_param = request.GET["username"]
        # if type(search_param) != str:
        #     return HttpResponseBadRequest("username GET parameter malformed")
        if search_param == '':
            return HttpResponseBadRequest("search param is empty string")
        users = find_users(search_param, request.user.username, False)
        return JsonResponse({
            "users": users
        })
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("no username (GET) parameter found in the request")


@login_required
def search_username(request):
    """Return the json response with the results of the search.
    Input and output are exactly of the same format as search view.
    However, returned results only contains those that usernames match. Names are not considered.

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        JsonResponse/HttpResponse: the result of the search
    """

    try:
        search_param = request.GET["username"]
        if search_param == '':
            return HttpResponseBadRequest("search param is empty string")
        users = find_users(search_param, request.user.username, True)
        return JsonResponse({
            "users": users
        })
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("no username (GET) parameter found in the request")


def find_friends(search_param, user_log_obj):
    """Find friends of the current user represented by the user log instance.

    Args:
        search_param (str): the search parameter to find users that have usernames with this as substring
        user_log_obj (UserLog): the UserLog instance representing the current user
    
    Returns:
        list(dict): a list of users that matches the search conditions, each represented by a dictionary.
        Each dictionary representing a user has the following fields:
            name: the name of the user
            username: the username of the user
            profile_pic_url: the URL to the profile picture of the user
            profile_link: the URL to the profile page of the user
    """
    search_param = search_param.lower()

    result = list(map(
        lambda user: ({
            "name": user.user_profile.name,
            "username": user.user_auth.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(user.user_auth.username,)),
            "profile_link": reverse("user_log:view_profile", args=(user.user_auth.username,)),
        }),
        filter(
            lambda user: search_param in user.user_auth.username.lower(),
            list(user_log_obj.friend_list.all())
        )
    ))
    result.sort(key=lambda user: user["name"].lower())
    return result


@login_required
def search_friend(request):
    """Search for a friend.
    The request must contain GET parameter of "username", which is the search parameter.
    The search returns friends with current user whose usernames contain the search parameter as substring.
    The returned json contains the following fields:
        users: the list of friends that match the query
    
    Args:
        request (HttpRequest): the request made to this view

    Returns:
        JsonResponse/HttpResponse: the result of the search.
    """

    try:
        search_param = request.GET["username"]
        if type(search_param) != str:
            return HttpRequestBadRequest("username GET parameter is not string!")
        users = find_friends(search_param, request.user.user_log)
        return JsonResponse({
            "users": users
        })
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("no username (GET) parameter found in the request")


@login_required
@require_http_methods(["POST"])
def delete_friend(request):
    """Delete friend from the friend list of the current user.
    The request must use post method, the body must be form data and must contain the following fields:
        username: the username of the friend to be deleted
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process. If the process is successful, response status is 200.
        Otherwise, response status is 400 with text as explanation of the error.
    """

    try:
        username = request.POST["username"]
        user_log_obj = UserAuth.objects.get(username=username).user_log
        if user_log_obj in list(request.user.user_log.friend_list.all()):
            request.user.user_log.friend_list.remove(user_log_obj)
            return HttpResponse("friend deleted")
        else:
            return HttpResponseBadRequest("user with username is not in your friend list")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request form data does not contain an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("user with provided username does not exist")


COMMON_TAG_PROPORTION_EXPONENT = 0.5


def compute_matching_index(user1, user2):
    """Computes the matching index between two users.
    Currently, the matching index ranges from 0 (no common tags) to 5.0 (have same set of tags and both active)

    Args:
        user1: user_auth object of the first user
        user2: user_auth object of the second user

    Returns: the matching index of the two users, computed with formula:
        common_tag_proportion = number of common tags / number of tags of the user with fewer tags
        final_scores_average = sum of final scores of each user with each common tag / (2 * number of common tags)
        matching_index = common_tag_proportion ** COMMON_TAG_PROPORTION_EXPONENT * final_scores_average

    """
    common_tag_list = (user1.user_profile.tagList & user2.user_profile.tagList).all()
    if len(common_tag_list == 0):
        return 0
    smaller_tag_list_length = min(user1.user_profile.tagList.count(), user2.user_profile.tagList.count())
    common_tag_proportion = len(common_tag_list) / smaller_tag_list_length

    final_scores_sum = 0
    for tag in common_tag_list:
        final_scores_sum += compute_tag_activity_final_score(get_tag_activity_record(user1, tag))
        final_scores_sum += compute_tag_activity_final_score(get_tag_activity_record(user2, tag))
    final_scores_average = final_scores_sum / (2 * len(common_tag_list))

    matching_index = common_tag_proportion ** COMMON_TAG_PROPORTION_EXPONENT * final_scores_average

    return matching_index

