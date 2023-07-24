from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import HttpResponse

from user_log.models import FriendRequest
from .models import FriendNotification


@login_required
def friends(request):
    """Returns the list of friends newly accepted.
    The JSON response contains the following fields:
        users: the list of users that has recently accepted users, each has the following fields:
            name: the name of the user,
            username: the username of the user,
            profile_link: link to profile page of the user,
            profile_pic_url: URL to profile pic of the user,

    Args:
        request (HttpRequest): the request sent to this view
    
    Returns:
        JsonResponse: the list of friends accepted invitation from current user
    """
    notifications = list(map(
        lambda notification: {
            "name": notification.from_user.user_profile.name,
            "username": notification.from_user.user_auth.username,
            "profile_link": reverse("user_log:view_profile", args=(notification.from_user.user_auth.username,)),
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(notification.from_user.user_auth.username,)),
        },
        FriendNotification.objects.filter(to_user=request.user.user_log).all()
    ))
    return JsonResponse({
        "users": notifications
    })