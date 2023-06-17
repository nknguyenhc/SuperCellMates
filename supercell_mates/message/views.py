from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse, HttpResponseBadRequest
from django.contrib.auth.decorators import login_required

from .models import TextMessage, PrivateChat


@login_required
def index(request):
    """Returns the template for viewing chats in web frontend

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the template for web frontend for viewing chats
    """
    return render(request, 'message/index.html')


def chat_info(chat_object):
    """Return the info of the chat in a dictionary, given the chat object.
    This method is not to be used directly, but only in group_chat_info and private_chat_info
    It has the following fields:
        id (str): the id of the room
        timestamp (int): the time that the last message in the chat was sent, in epoch time
        
    Args:
        chat_object (AbstractChat): an instance of the Chat class
    
    Returns:
        dict: the dictionary containing the info of the chat
    """
    return {
        "id": chat_object.id,
        "timestamp": chat_object.timestamp.timestamp(),
    }


def group_chat_info(group_chat_object):
    """Returns the info of the group chat in a dictionary, given the group chat object.
    It has the fields returned by the chat_info method, and the following fields specific to group chats:
    """
    pass


def private_chat_info(request_user_auth, private_chat_object):
    """Returns the info of the private chat in a dictionary, given the private chat object.
    It has the fields returned by the chat_info method, and the following fields specific to private chat:
        user: the other user of the chat, with the following fields:
            name: the name of the user
            username: the username of the user
            profile_link: the link to the profile of the user
            profile_img_url: the URL to the profile image of the user
    This method assumes that the request_user_auth is in the private_chat_object.
    Error handling must be done in the views that call this method.
    
    Args:
        request_user_auth (UserAuth): the UserAuth instance of the current user
        private_chat_object (PrivateChat): the private chat instance
    
    Returns:
        dict: the dictionary containing the info of the chat
    """
    this_chat_info = chat_info(private_chat_object)
    the_other_user = list(filter(
        lambda user: user.username != request_user_auth.username,
        list(private_chat_object.users.all())
    ))[0]
    this_chat_info["user"] = {
        "name": the_other_user.user_profile.name,
        "username": the_other_user.username,
        "profile_link": reverse("user_log:view_profile", args=(the_other_user.username,)),
        "profile_img_url": reverse("user_profile:get_profile_pic", args=(the_other_user.username,)),
    }
    return this_chat_info


@login_required
def get_group_chats(request):
    """Get information of all group chats of the current user.
    The information of each group chat is a dictionary returned by the function group_chat_info above.
    The returned json contains the following fields:
        groups: the list of group chats the current user is in
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        JsonResponse: the information of the group chats of the current user
    """
    return JsonResponse({
        "groups": list(map(
            lambda group: group_chat_info(group),
            list(request.user.group_chats.all())
        ))
    })


@login_required
def get_private_chats(request):
    """Get information of all private chats of the current user.
    The information of each private chat is a dictionary returned by the function private_chat_info above.
    The returned json contains the following fields:
        privates: the list of private chats the current user is in
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        JsonResponse: the information of the private chats of the current user
    """
    return JsonResponse({
        "privates": list(map(
            lambda chat: private_chat_info(request.user, chat),
            list(request.user.private_chats.all())
        ))
    })


def message_info(message_obj):
    """Get the info of a message in a dictionary.
    The returned dictionary contains the following fields:
        id: the id of the message
        timestamp: the timestamp of the message in epoch time
        user: the sender of the message, in the form of a dict, with the following fields:
            name: the name of the user
            username: the username of the user
            profile_link: the link to the profile of the user
            profile_img_url: the URL to the profile image of the user
    """
    result = {
        "id": message_obj.id,
        "timestamp": message_obj.timestamp.timestamp(),
        "user": {
            "name": message_obj.user.user_profile.name,
            "username": message_obj.user.username,
            "profile_link": reverse("user_log:view_profile", args=(message_obj.user.username,)),
            "profile_img_url": reverse("user_profile:get_profile_pic", args=(message_obj.user.username,)),
        },
        "type": "text" if isinstance(message_obj, TextMessage) else "unknown"
    }
    if result["type"] == "text":
        result["message"] = message_obj.text
    return result


@login_required
def get_private_messages(request, chat_id):
    """Get all messages in a given chat id.
    This view checks for whether the person is in the chat before releasing the messages.
    The returned response contains the following fields:
        messages: a list of dicts representing info of the messages, each is the result of the message_info function above

    Args:
        request (HttpRequest): the request made to this view
        chat_id (str): the chat id to search for messages
    
    Returns:
        JsonResponse: the json containing the info of all messages in the chat
    """
    try:
        chat_obj = PrivateChat.objects.get(id=chat_id)
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat does not exist")
    
    all_messages = list(chat_obj.text_messages.all())
    # sort messages by time

    return JsonResponse({
        "messages": list(map(
            lambda message: message_info(message),
            all_messages
        ))
    })