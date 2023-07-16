from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, FileResponse, HttpResponseNotFound
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate
from django.utils.datastructures import MultiValueDictKeyError
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.http import require_http_methods
from datetime import datetime
from django.core.files.base import ContentFile
from PIL import Image
from user_profile.views import verify_image

from user_auth.models import UserAuth
from .models import TextMessage, PrivateChat, FileMessage, PrivateFileMessage, GroupChat, GroupFileMessage, ReplyPostMessage


@login_required
def index(request):
    """Returns the template for viewing chats in web frontend

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the template for web frontend for viewing chats
    """
    return render(request, 'message/index.html')


@login_required
@require_http_methods(["POST"])
def create_group_chat(request):
    """Creates a group chat and return the response of the process.
    The request must use POST method, and the body form data must contain the following fields:
        group_name: the name of the group chat
        users: the list of usernames to add to the group. Note that the users being added must be friends with the request user.
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process
    """
    try:
        users = request.POST.getlist('users')
        group_name = request.POST["group_name"]
        groupchat = GroupChat(timestamp=datetime.now().timestamp(), name=group_name, creator=request.user)
        groupchat.save()
        for user in users:
            if not UserAuth.objects.get(username=user).user_log.friend_list.filter(user_auth=request.user).exists():
                return HttpResponseBadRequest("One of the users you indicated is not your friend!")
        groupchat.users.add(request.user)
        groupchat.admins.add(request.user)
        for user in users:
            groupchat.users.add(UserAuth.objects.get(username=user))
        groupchat.save()
        return JsonResponse({
            "id": groupchat.id,
            "timestamp": groupchat.timestamp,
            "name": group_name,
            "img": reverse("message:get_group_chat_rep_img", args=(groupchat.id,)),
        })
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("Group name not provided")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("One of the users you indicated does not exist")


@login_required
def get_members(request):
    """Get the members in the chatid provided in the GET request
    The current user must be a member of the group chat to view the members.
    The request URL must contain the following GET parameter:
        chatid: the id of the chat to get the members.
    
    The returned JSON response contains the following fields:
        members: the list of members of the current chat, with the following fields:
            name: the name of the member
            username: the username of the member
            profile_link: the link to the profile of the member
            profile_pic_url: the URL to the profile picture of the member
    """
    try:
        chat_id = request.GET["chatid"]

        chat = GroupChat.objects.get(id=chat_id)
        if not chat.users.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("you do not have access to this chat")
        
        users = list(map(
            lambda user: {
                "name": user.user_profile.name,
                "username": user.username,
                "profile_link": reverse("user_log:view_profile", args=(user.username,)),
                "profile_pic_url": reverse("user_profile:get_profile_pic", args=(user.username,)),
            },
            list(chat.users.all())
        ))
        users.sort(key=lambda user: user["username"].lower())
        
        return JsonResponse({
            "users": users
        })
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("chat id not found in GET parameters")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("invalid chat id")


@login_required
@require_http_methods(["POST"])
def add_member(request):
    """Attempt to add a member into a chat.
    This view checks for whether the request user is in the chat before adding the new member.
    This view also checks if the new user and the current user are friends.
    The body of the request must contain the following fields:
        username: the username of the user to add into the group
        chat_id: the id of the group chat to add the user into
    
    Args: 
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process
    """
    try:
        username = request.POST["username"]
        chat_id = request.POST["chat_id"]

        chat = GroupChat.objects.get(id=chat_id)
        if not chat.users.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("you are not in this group chat")
        
        new_user = UserAuth.objects.get(username=username)
        if not new_user.user_log.friend_list.filter(user_auth=request.user).exists():
            return HttpResponseBadRequest("you are not friend with this user")
        
        chat.users.add(new_user)
        return HttpResponse('ok')
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("user with provided username not found / chat with provided chatid not found")


@login_required
def is_admin(request):
    """Determine if the current user is admin of a given chat, id given in GET parameters.
    GET parameters:
        chatid: the chat id to check
    """
    try:
        chat_id = request.GET["chatid"]
        return HttpResponse("yes" if GroupChat.objects.get(id=chat_id).admins.filter(username=request.user.username).exists() else "no")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("chatid GET parameter not found")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat with provided chatid not found")


@login_required
def is_creator(request):
    """Determine if the current user is the creator of a given chat, id given in GET parameters.
    GET parameters:
        chatid: the chat id to check
    """
    try:
        chat_id = request.GET["chatid"]
        return HttpResponse("yes" if GroupChat.objects.get(id=chat_id).creator == request.user else "no")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("chatid GET parameter not found")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat with provided chatid not found")


@login_required
@require_http_methods(["POST"])
def remove_user(request):
    """Remove a user from a group chat.
    POST parameters:
        chatid: the chat to remove the user from
        username: the username of the user to remove from the chat
    """

    try:
        chat_id = request.POST["chatid"]

        chat = GroupChat.objects.get(id=chat_id)
        if not chat.admins.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("you are not admin of this chat")
        
        username = request.POST["username"]
        user = UserAuth.objects.get(username=username)
        if user == request.user:
            return HttpResponseBadRequest("removing yourself, wrong API used")
        if chat.admins.filter(username=username).exists() and chat.creator != request.user:
            return HttpResponseBadRequest("you cannot remove another admin")
        chat.users.remove(user)
        chat.admins.remove(user) # in case the person doing this request is the creator
        return HttpResponse("ok")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat with provided chat id not found / user with provided username not found")


@login_required
def get_admins(request):
    """Get the members in the chatid provided in the GET request
    The current user must be a member of the group chat to view the members.
    The request URL must contain the following GET parameter:
        chatid: the id of the chat to get the members.
    
    The returned JSON response contains the following fields:
        members: the list of members of the current chat, with the following fields:
            name: the name of the member
            username: the username of the member
            profile_link: the link to the profile of the member
            profile_pic_url: the URL to the profile picture of the member
    """

    try:
        chat_id = request.GET["chatid"]

        chat = GroupChat.objects.get(id=chat_id)
        if not chat.admins.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("you are not an admin of this chat")
        
        users = list(map(
            lambda user: {
                "name": user.user_profile.name,
                "username": user.username,
                "profile_link": reverse("user_log:view_profile", args=(user.username,)),
                "profile_pic_url": reverse("user_profile:get_profile_pic", args=(user.username,)),
            },
            list(chat.admins.all())
        ))
        users.sort(key=lambda user: user["username"].lower())
        
        return JsonResponse({
            "users": users
        })

    except MultiValueDictKeyError:
        return HttpResponseBadRequest("chatid GET parameter not found")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat with provided chatid not found")


@login_required
@require_http_methods(["POST"])
def add_admin(request):
    """Add a user as an admin of the chat. The target user must already be in the chat.
    The person that makes this request must be an admin of the chat.
    The body must contain the following POST parameters:
        chatid: the id of the chat to add admin
        username: the username of the user to add as admin
    """

    try:
        chat_id = request.POST["chatid"]

        chat = GroupChat.objects.get(id=chat_id)
        if not chat.admins.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("you are not admin of this chat")
        
        username = request.POST["username"]
        user = UserAuth.objects.get(username=username)
        if not chat.users.filter(username=username).exists():
            return HttpResponseBadRequest("target user not in this group chat")

        chat.admins.add(user)
        return HttpResponse("ok")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat with provided chatid not found / user with provided username not found")


@login_required
@require_http_methods(["POST"])
def remove_admin(request):
    """Remove a user as admin. The request user must be creator of the chat.
    The body must contain the following POST parameters:
        chatid: the id of the chat to add admin
        username: the username of the user to remove admin
    """

    try:
        chat_id = request.POST["chatid"]

        chat = GroupChat.objects.get(id=chat_id)
        if chat.creator != request.user:
            return HttpResponseBadRequest("you are not the creator of this chat")
        
        username = request.POST["username"]
        user = UserAuth.objects.get(username=username)
        chat.admins.remove(user)
        return HttpResponse("ok")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat with provided chatid not found / user with provided username not found")


@login_required
@require_http_methods(["POST"])
def assign_leader(request):
    """Assign another user as creator. The request user must be creator of the chat.
    The target user must be admin first before he/she can be assigned creator
    The body must contain the following POST parameters:
        chatid: the id of the chat to assign the new creator
        username: the username of the new creator
        password: the password of the request user (i.e. current creator), for confirmation
    """

    try:
        chat_id = request.POST["chatid"]

        chat = GroupChat.objects.get(id=chat_id)
        if chat.creator != request.user:
            return HttpResponseBadRequest("you are not the creator of this chat")
        
        password = request.POST["password"]
        curr_creator = authenticate(username=request.user.username, password=password)
        if curr_creator != request.user:
            return HttpResponse("authentication fails")
        
        username = request.POST["username"]
        user = UserAuth.objects.get(username=username)
        if not chat.admins.filter(username=username).exists():
            return HttpResponseBadRequest("user with provided username not admin of this chat")
        
        chat.creator = user 
        chat.save()
        return HttpResponse("ok")

    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat with provided chatid not found / user with provided username not found")


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
        "timestamp": chat_object.timestamp,
    }


@login_required
def get_group_chat_rep_img(request, chat_id):
    """Return the representative image of a group chat.
    This view checks whether the user is in the group chat first before allowing the user to access the photo.

    Args:
        request (HttpRequest): request made to this view
        chat_id (str): the id of the group chat to view rep image
    
    Returns:
        FileResponse: the representative image of the group chat
    """
    try:
        groupchat = GroupChat.objects.get(id=chat_id)
        if request.user in groupchat.users.all():
            rep_img = groupchat.rep_img
            if rep_img:
                return FileResponse(rep_img)
            else:
                return redirect('/static/media/default_profile_pic.jpg')
        else:
            return HttpResponseBadRequest("You are not in this chat")
    except ObjectDoesNotExist:
        return HttpResponseNotFound()


def group_chat_info(group_chat_object):
    """Returns the info of the group chat in a dictionary, given the group chat object.
    It has the fields returned by the chat_info method, and the following fields specific to group chats:
        img: the representative image of the group chat
        name: the name of the group chat
    
    Args:
        group_chat_object (GroupChat): the instance of GroupChat
    
    Returns:
        dict: the dictionary containing the info of the chat
    """
    this_chat_info = chat_info(group_chat_object)
    this_chat_info.update({
        "img": reverse("message:get_group_chat_rep_img", args=(group_chat_object.id,)),
        "name": group_chat_object.name
    })
    return this_chat_info


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
def get_chat_id(request):
    """Get chat id between the request user and the target user.
    Request must contain the following GET parameters:
        username: the username of the target user
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the response with the chat id between the request user and the target user
    """
    try:
        username = request.GET['username']
        for private_chat in request.user.private_chats.all():
            if private_chat.users.filter(username=username).exists():
                return HttpResponse(private_chat.id)
        return HttpResponse("no chat found")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("username GET parameter not found")


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
    chats = list(map(
        lambda group: group_chat_info(group),
        list(request.user.group_chats.all())
    ))
    chats.sort(key=lambda chat: chat["timestamp"], reverse=True)
    return JsonResponse({
        "groups": chats
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
        "timestamp": message_obj.timestamp,
        "user": {
            "name": message_obj.user.user_profile.name,
            "username": message_obj.user.username,
            "profile_link": reverse("user_log:view_profile", args=(message_obj.user.username,)),
            "profile_img_url": reverse("user_profile:get_profile_pic", args=(message_obj.user.username,)),
        },
        "type": "reply_post" if isinstance(message_obj, ReplyPostMessage) else "text" if isinstance(message_obj, TextMessage) else "file" if isinstance(message_obj, FileMessage) else "unknown"
    }
    if result["type"] == "text":
        result["message"] = message_obj.text
    elif result["type"] == "file":
        result.update({
            "file_name": message_obj.file_name,
            "is_image": message_obj.is_image
        })
    elif result["type"] == "reply_post":
        result.update({
            "message": message_obj.text,
            "post": {
                "id": message_obj.post.id,
                "title": message_obj.post.title,
                "content": message_obj.post.content
            } if message_obj.post else None
        })
    return result


def merge_messages(all_text_messages, all_reply_post_messages, all_file_messages):
    def next_message_timestamp(message_list, i):
        return message_list[i].timestamp if i < len(message_list) else 1e10

    all_messages = []
    text_i = 0
    post_i = 0
    file_i = 0
    while text_i < len(all_text_messages) or post_i < len(all_reply_post_messages) or file_i < len(all_file_messages):
        next_timestamp = min(
            next_message_timestamp(all_text_messages, text_i), 
            next_message_timestamp(all_reply_post_messages, post_i), 
            next_message_timestamp(all_file_messages, file_i)
        )
        if next_message_timestamp(all_text_messages, text_i) == next_timestamp:
            all_messages.append(all_text_messages[text_i])
            text_i += 1
        elif next_message_timestamp(all_file_messages, file_i) == next_timestamp:
            all_messages.append(all_file_messages[file_i])
            file_i += 1
        else:
            all_messages.append(all_reply_post_messages[post_i])
            post_i += 1
    return all_messages


def start_and_end(request):
    """Return the start and end values in the parameter, if there is an error, return a string.

    Args:
        request (HttpRequest): the request to extract GET parameters from
    
    Returns:
        tuple/str: start and end from the request GET parameters, or a string if there is an error
    """
    try:
        start = float(request.GET["start"])
        end = float(request.GET["end"])
        return (start, end)
    except MultiValueDictKeyError:
        return "start and end GET parameters not provided"
    except ValueError:
        return "GET parameter provided not a number"
    except OSError:
        return "time provided is too large, not epoch time"


def get_texts(chat_obj, start, end):
    all_text_messages = list(chat_obj.text_messages.filter(timestamp__range=(start, end)).all())
    all_reply_post_messages = list(chat_obj.reply_post_messages.filter(timestamp__range=(start, end)).all()) if isinstance(chat_obj, PrivateChat) else []
    all_file_messages = list(chat_obj.file_messages.filter(timestamp__range=(start, end)).all())
    all_messages = merge_messages(all_text_messages, all_reply_post_messages, all_file_messages)
    
    next_text_messages = chat_obj.text_messages.filter(timestamp__lt=start).order_by("timestamp")
    next_file_messages = chat_obj.file_messages.filter(timestamp__lt=start).order_by("timestamp")
    next_reply_post_messages = chat_obj.reply_post_messages.filter(timestamp__lt=start).order_by("timestamp") if isinstance(chat_obj, PrivateChat) else None
    next_last_timestamp = max(
        next_text_messages.last().timestamp if next_text_messages.exists() else 0,
        0 if next_reply_post_messages is None else next_reply_post_messages.last().timestamp if next_reply_post_messages.exists() else 0,
        next_file_messages.last().timestamp if next_file_messages.exists() else 0
    )
    
    return all_messages, next_last_timestamp


@login_required
def get_group_messages(request, chat_id):
    """Get messages in a given chat id within the given time frame.
    This view checks for whether the person is in the chat before releasing the messages.
    GET parameters:
        start: the start time in epoch time
        end: the end time in epoch time
    The returned response contains the following fields:
        messages: a list of dicts representing the info of the messages, each is the result of the message_info function above
        next_last_timestamp: the end timestamp that the next request should have
    
    Args:
        request (HttpRequest): the request made to this view
        chat_id (str): the chat id to search for messages
    
    Returns:
        JsonResponse: the json containing the info of all messages in the chat
    """
    try:
        chat_obj = GroupChat.objects.get(id=chat_id)
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("chat does not exist")
    
    if not chat_obj.users.filter(username=request.user.username).exists():
        return HttpResponseBadRequest("you do not have access to this chat")
    
    get_params = start_and_end(request)
    if type(get_params) == str:
        return HttpResponseBadRequest(get_params)
    start, end = get_params
    
    all_messages, next_last_timestamp = get_texts(chat_obj, start, end)

    return JsonResponse({
        "messages": list(map(
            lambda message: message_info(message),
            all_messages
        )),
        "next_last_timestamp": next_last_timestamp
    })


@login_required
def get_private_messages(request, chat_id):
    """Get messages in a given chat id within the given time frame.
    This view checks for whether the person is in the chat before releasing the messages.
    GET parameters:
        start: the start time in epoch time
        end: the end time in epoch time
    The returned response contains the following fields:
        messages: a list of dicts representing info of the messages, each is the result of the message_info function above
        next_last_timestamp: the end timestamp that the next incoming request should have

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
    
    get_params = start_and_end(request)
    if type(get_params) == str:
        return HttpResponseBadRequest(get_params)
    start, end = get_params
    
    all_messages, next_last_timestamp = get_texts(chat_obj, start, end)

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
        elif GroupChat.objects.filter(id=chat_id).exists():
            chat_obj = GroupChat.objects.get(id=chat_id)
        else:
            return HttpResponseBadRequest("no chat room found")
        
        if not chat_obj.users.filter(username=request.user.username).exists():
            return HttpResponseBadRequest("you do not have access to this chat")

        is_image = True

        if "file" in request.POST:
            file_bytearray = request.POST["file"].strip("[]").split(", ")
            file_bytearray = bytearray(list(map(lambda x: int(x.strip()), file_bytearray)))
            file_uploaded = ContentFile(file_bytearray, name=request.POST["file_name"])
            try:
                pil_img = Image.open(file_uploaded)
                pil_img.verify()
            except (IOError, SyntaxError):
                is_image = False
        else:
            file_uploaded = request.FILES["file"]
            is_image = verify_image(file_uploaded)
        file_name = request.POST["file_name"]
        if isinstance(chat_obj, PrivateChat):
            file_message = PrivateFileMessage(timestamp=datetime.now().timestamp(), file_field=file_uploaded, file_name=file_name, chat=chat_obj, user=request.user, is_image=is_image)
        else:
            file_message = GroupFileMessage(timestamp=datetime.now().timestamp(), file_field=file_uploaded, file_name=file_name, chat=chat_obj, user=request.user, is_image=is_image)
        file_message.save()
        chat_obj.timestamp = datetime.now().timestamp()
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
        if PrivateFileMessage.objects.filter(id=message_id).exists():
            message = PrivateFileMessage.objects.get(id=message_id)
        else:
            message = GroupFileMessage.objects.get(id=message_id)
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

    try:
        if not UserAuth.objects.get(username=username).user_log.friend_list.filter(user_auth=request.user).exists():
            return HttpResponseBadRequest("You are not friend with this user!")
        result = list(filter(
            lambda chat: chat.users.filter(username=username).exists(),
            list(request.user.private_chats.all())
        ))[0]
        return HttpResponse(result.id)
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("user with provided username not found")