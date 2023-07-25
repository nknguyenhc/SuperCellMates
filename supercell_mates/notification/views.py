from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.urls import reverse
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.core.exceptions import ObjectDoesNotExist
from django.utils.datastructures import MultiValueDictKeyError

from user_log.models import FriendRequest
from .models import FriendNotification
from message.models import PrivateChat, GroupChat, PrivateTextMessage, GroupTextMessage, PrivateFileMessage, GroupFileMessage, ReplyPostMessage


@login_required
@require_http_methods(["POST"])
def friends(request):
    """Returns the list of friends newly accepted.
    The JSON response contains the following fields:
        users: the list of users that has recently accepted users, each has the following fields:
            name: the name of the user,
            username: the username of the user,
            profile_link: link to profile page of the user,
            profile_pic_url: URL to profile pic of the user,
    This view deletes all friend acceptance notification right after it is retrieved. Frontend is responsible for caching the notifs.

    Args:
        request (HttpRequest): the request sent to this view
    
    Returns:
        JsonResponse: the list of friends accepted invitation from current user
    """
    all_friend_notification_objects = FriendNotification.objects.filter(to_user=request.user.user_log).all()
    notifications = list(map(
        lambda notification: {
            "name": notification.from_user.user_profile.name,
            "username": notification.from_user.user_auth.username,
            "profile_link": reverse("user_log:view_profile", args=(notification.from_user.user_auth.username,)),
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(notification.from_user.user_auth.username,)),
        },
        all_friend_notification_objects
    ))
    for friend_notification_object in all_friend_notification_objects:
        friend_notification_object.delete()
    return JsonResponse({
        "users": notifications
    })


def has_new_message(chat_obj, request_user):
    """Returns whether the chat object has new messages, given the last seen.

    Args:
        chat_obj (AbstractChat): the chat object to check
        request_user (UserAuth): the user that requested to see this chat
    
    Returns:
        bool: whether the chat has new message
    """

    messages = [
        chat_obj.text_messages,
        chat_obj.file_messages
    ]
    if isinstance(chat_obj, PrivateChat):
        messages.append(chat_obj.reply_post_messages)
    
    messages = list(map(lambda messages: messages.order_by("timestamp").last() if messages.exists() else None, messages))
    latest_timestamp = 0
    latest_message_i = -1
    for i in range(len(messages)):
        message = messages[i]
        if message is not None:
            if message.timestamp > latest_timestamp:
                latest_timestamp = message.timestamp
                latest_message_i = i 
    if latest_message_i != -1:
        return not messages[latest_message_i].seen_users.filter(username=request_user.username).exists()
    return False


@login_required
def chats_new_messages(request):
    """Returns chats with new messages.

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the http response containing information of number of chats with new messages
    """
    privates = list(map(
        lambda chat: chat.id,
        filter(
            lambda chat: has_new_message(chat, request.user),
            request.user.private_chats.all()
        )
    ))

    groups = list(map(
        lambda chat: chat.id,
        filter(
            lambda chat: has_new_message(chat, request.user),
            request.user.group_chats.all()
        )
    ))

    return JsonResponse({
        "privates": privates,
        "groups": groups
    })


@login_required
@require_http_methods(["POST"])
def see_message(request):
    """Mark a chat message as viewed. The request body must contain the following fields:
        message_id: the id of the message
        type: the type of the message, which is either 'text private', 'reply_post private', 'file private',
            'text group', 'file group'
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process
    """

    try:
        message_id = request.POST["message_id"]
        message_type = request.POST["type"]
        if message_type == "text private":
            message = PrivateTextMessage.objects.get(id=message_id)
        elif message_type == "text group":
            message = GroupTextMessage.objects.get(id=message_id)
        elif message_type == "file private":
            message = PrivateFileMessage.objects.get(id=message_id)
        elif message_type == "file group":
            message = GroupFileMessage.objects.get(id=message_id)
        elif message_type == "reply_post private":
            message = ReplyPostMessage.objects.get(id=message_id)
        else:
            return HttpResponseBadRequest("type argument not recognised")
        if not message.chat.users.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("how dare you obtained another person's message id")
        message.seen_users.add(request.user)
        return HttpResponse("ok")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("message with message id not found")