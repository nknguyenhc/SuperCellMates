from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, FileResponse, HttpResponseNotFound
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_http_methods
from datetime import datetime
from user_profile.views import verify_image

from user_auth.models import UserAuth
from .models import TextMessage, PrivateChat, FileMessage, PrivateFileMessage


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
    return HttpResponse("not yet implemented")


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
    chats = list(map(
        lambda chat: private_chat_info(request.user, chat),
        list(request.user.private_chats.all())
    ))
    chats.sort(key=lambda chat: chat["timestamp"], reverse=True)
    return JsonResponse({
        "privates": chats
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
        "type": "text" if isinstance(message_obj, TextMessage) else "file" if isinstance(message_obj, FileMessage) else "unknown"
    }
    if result["type"] == "text":
        result["message"] = message_obj.text
    elif result["type"] == "file":
        result.update({
            "file_name": message_obj.file_name,
            "is_image": message_obj.is_image
        })
    return result


def merge_messages(all_text_messages, all_file_messages):
    all_messages = []
    text_i = 0
    file_i = 0
    while text_i < len(all_text_messages) or file_i < len(all_file_messages):
        if text_i == len(all_text_messages):
            all_messages.append(all_file_messages[file_i])
            file_i += 1
        elif file_i == len(all_file_messages):
            all_messages.append(all_text_messages[text_i])
            text_i += 1
        elif all_text_messages[text_i].timestamp < all_file_messages[file_i].timestamp:
            all_messages.append(all_text_messages[text_i])
            text_i += 1
        else:
            all_messages.append(all_file_messages[file_i])
            file_i += 1
    return all_messages


@login_required
def get_private_messages(request, chat_id):
    """Get all messages in a given chat id.
    This view checks for whether the person is in the chat before releasing the messages.
    GET parameters:
        start: the start time in epoch time
        end: the end time in epoch time
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
    
    if not chat_obj.users.filter(username=request.user.username).exists():
        return HttpResponseBadRequest("you do not have access to this chat")
    
    try:
        start = datetime.fromtimestamp(float(request.GET["start"]))
        end = datetime.fromtimestamp(float(request.GET["end"]))
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("start and end GET parameters not provided")
    except ValueError:
        return HttpResponseBadRequest("GET parameter provided not a number")
    except OSError:
        return HttpResponseBadRequest("time provided is too large, not epoch time")
    
    all_text_messages = list(chat_obj.text_messages.filter(timestamp__range=(start, end)).all())
    all_file_messages = list(chat_obj.file_messages.filter(timestamp__range=(start, end)).all())
    all_messages = merge_messages(all_text_messages, all_file_messages)
    
    next_last_timestamp = 0
    next_text_messages = chat_obj.text_messages.filter(timestamp__lt=start)
    next_file_messages = chat_obj.file_messages.filter(timestamp__lt=start)
    if next_text_messages.exists():
        next_last_timestamp = next_text_messages.order_by("timestamp").last().timestamp.timestamp()
        print(next_last_timestamp)
        if next_file_messages.exists():
            next_last_timestamp = max(next_last_timestamp, next_file_messages.order_by("timestamp").last().timestamp.timestamp())
    elif next_file_messages.exists():
        next_last_timestamp = next_file_messages.order_by("timestamp").last().timestamp.timestamp()

    return JsonResponse({
        "messages": list(map(
            lambda message: message_info(message),
            all_messages
        )),
        "next_last_timestamp": next_last_timestamp
    })


@login_required
@require_http_methods(["POST"])
def upload_file(request):
    """Upload a file through a message.
    The view checks for access privileges before processing file uploading
    The request body must contain the following fields:
        file: the file to be uploaded
        file_name: the name of the file
        chat_id: the id of the chat to upload
    """
    try:
        chat_id = request.POST["chat_id"]
        if PrivateChat.objects.filter(id=chat_id).exists():
            chat_obj = PrivateChat.objects.get(id=chat_id)
        else:
            return HttpResponseBadRequest("no chat room found")
        
        if not chat_obj.users.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("you do not have access to this chat")
        
        file_uploaded = request.FILES["file"]
        file_name = request.POST["file_name"]
        file_message = PrivateFileMessage(file_field=file_uploaded, file_name=file_name, chat=chat_obj, user=request.user, is_image=verify_image(file_uploaded))
        file_message.save()
        chat_obj.timestamp = datetime.now()
        chat_obj.save()
        return HttpResponse(file_message.id)
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request is missing an important key")


@login_required
def get_image(request, message_id):
    """Attempt to get an image by the message id.
    The user must be in the chat in order to see the file.
    If the id does not match any message, return 404.
    Checking whether the returned file is an image must be done in elsewhere.
    """
    try:
        message = PrivateFileMessage.objects.get(id=message_id)
        if not message.chat.users.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("you do not have access to this chat message")

        file_field = message.file_field
        return FileResponse(file_field)
    except ObjectDoesNotExist:
        return HttpResponseNotFound("message not found")


@login_required
def get_private_chat_id(request, username):
    """Get the id of the private chat between request user and target user.
    
    Args:
        request (HttpRequest): the request made to this view
        username (str): the username of the target user
    
    Returns:
        HttpResponse: the response with the id of the private chat
    """

    if not UserAuth.objects.get(username=username).user_log.friend_list.filter(user_auth=request.user).exists():
        return HttpResponseBadRequest("You are not friend with this user!")
    result = list(filter(
        lambda chat: chat.users.filter(username=username).exists(),
        list(request.user.private_chats.all())
    ))[0]
    return HttpResponse(result.id)