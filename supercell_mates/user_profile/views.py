from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse, FileResponse
from django.http.response import FileResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate
from .models import UserProfile, TagActivityRecord
from user_auth.models import UserAuth, Tag
import io
from django.core.files.images import ImageFile
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
# import magic
from django.conf import settings
from PIL import Image
import json
from datetime import datetime

from user_auth.models import Tag, UserAuth
from user_log.models import FriendRequest


def layout_context(user_auth_obj):
    """Returns the context to be used in templates that uses user_profile layout.

    Args:
        user_auth_obj (UserAuth): the UserAuth instance to be rendered on the user_profile layout

    Returns:
        dict: a dictionary to be used as part of context during template rendering.
        The dictionary contains the following fields:
            user_profile: a dictionary contains the information of the target user, with the following fields:
                name: the name of the target user
                username: the username of the target user
            image_url: the URL to the profile picture of the target user
    """

    return {
        "user_profile": {
            "name": user_auth_obj.user_profile.name,
            "username": user_auth_obj.username
        },
        "image_url": reverse("user_profile:get_profile_pic", args=(user_auth_obj.username,)),
    }



def get_tag_list(user_auth_obj):
    return list(map(
        lambda tag: ({
            "name": tag.name,
            "icon": reverse('user_profile:get_tag_icon', args=(tag.id,)),
        }),
        list(user_auth_obj.user_profile.tagList.all())
    ))


def index_context(user_auth_obj):
    """Returns the context to be used in profile page of the currently logged in user.

    Args:
        user_auth_obj (UserAuth): the UserAuth instance of the currently logged in user

    Returns:
        dict: a dictionary to be used as the context during template rendering of the user's profile page.
        The dictionary contains the following fields:
            image_url: the URL to the profile image of the current user
            user_profile: the dictionary contains the information on the profile of the current user, with the following fields:
                name: the name of the current user
                username: the username of the current user
            tags: the list of tags of the current user. Each tag is represented by a dictionary with the following fields:
                name: the name of the tag
                icon: the URL to the icon of the tag
            whose corresponding value is the name of the tag.
            my_profile: whether the target user to be rendered on the template is the same as request user, True by default
            is_admin: whether the current user is an admin of this website, True if it is, False otherwise
    """

    result = {
        "tags": get_tag_list(user_auth_obj),
        "my_profile": True,
        "is_admin": user_auth_obj.is_staff
    }
    result.update(layout_context(user_auth_obj))
    return result


@login_required
def get_user_tags(request, username):
    try:
        tags = get_tag_list(UserAuth.objects.get(username=username))
        return JsonResponse({ "tags": tags })
    except ObjectDoesNotExist:
        return HttpResponseNotFound()


@login_required
def index(request):
    """Returns the template for the currently logged in user's profile page.
    The context is obtained using the index_context function above.

    Args:
        request (HttpRequest): the request made to this view

    Returns:
        HttpResponse: the template rendered with the given context
    """
    return render(request, 'user_profile/index.html', index_context(request.user))

@login_required
@ensure_csrf_cookie
def index_async(request):
    """Returns the context to be used in front-end of mobile app, in the form of a json.
    The dictionary of context is obtained using the index_context function above.

    Args:
        request (HttpRequest): the request made to this view

    Returns:
        JsonResponse: the json response sent to front-end of mobile app
    """
    return JsonResponse(index_context(request.user))


@login_required
@require_http_methods(["POST"])
def add_tags(request):
    """Attempt to add tags for the currently logged in user and return the feedback of the result.
    The request method must be post, and the body (request.POST) must have the following attributes:
        count: the number of tags to be added
        tags: the list of tags to be added, each element is a string representing the tag

    Args:
        request (HttpRequest): the request made to this view

    Returns:
        HttpResponse: feedback of whether the tags were added successfully.
        Status code is 200 only when it is successfully, otherwise status code 405 is returned with the text as explanation for the error.
    """

    try:
        user_profile_obj = request.user.user_profile
        count = int(request.POST["count"])
        if count + len(list(user_profile_obj.tagList.all())) > user_profile_obj.tag_count_limit:
            return HttpResponseBadRequest("tag limit exceeded")
        requested_tags = request.POST.getlist("tags")
        for i in range(count):
            tag_obj = Tag.objects.get(name=requested_tags[i])
            user_profile_obj.tagList.add(tag_obj)
            tag_activity_record = TagActivityRecord(user_profile=user_profile_obj, tag=tag_obj)
            tag_activity_record.save()
        return HttpResponse("success")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ValueError:
        return HttpResponseBadRequest("tags value is not in proper list format / count submitted is not integer")
    except IndexError:
        return HttpResponseBadRequest("number of tags submitted is smaller than tag count")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("one of the tag names is malformed")
    except TypeError:
        return HttpResponseBadRequest("tags input field is not array")


@login_required
def setup(request):
    """Render template for setup view.

    Args:
        request (HttpRequest): the request made to this view

    Returns:
        HttpResponse: the template of the setup view wrapped in an http response
    """
    return render(request, "user_profile/setup.html")


@login_required
def obtain_tags(request):
    """Return the list of tags associated with the current user.
    The response is in the form of json, which consists of the following fields:
        tags: the tags of the current user
        tag_count_limit: the limit on the number of tags of the current user
    The corresponding value is the list of tags associated with the current user.
    Each tag (element) has the following fields:
        name (str): the string representation of this tag
        icon (str): the URL to the icon of the tag

    Args:
        request (HttpRequest): the request made to this view

    Returns:
        JsonResponse: response containing the list of currently available tags and indication of whether the current user has the tags
    """

    tags = list(map(lambda tag: {
        "name": tag.name,
        "icon": reverse('user_profile:get_tag_icon', args=(tag.id,)),
    }, list(request.user.user_profile.tagList.all())))
    return JsonResponse({
        "tags": tags,
        "tag_count_limit": request.user.user_profile.tag_count_limit
    })


def find_tags(search_param, user_profile_obj):
    """Return the list of tags that match the search parameter.
    The search returns the tags that contains the search parameter, excluding those that the current user already has.
    Each item in the list is a dictionary with the following fields:
        name: the name of the tags
        icon: the URL to the icon of the tag

    Args:
        search_param (str): the search parameter
        user_profile_obj (UserProfile): the instance of UserProfile that represents the user making this search.

    Returns:
        list(dict): the list of tags that match the search parameter
    """

    user_tags = set(user_profile_obj.tagList.all())
    search_param = search_param.lower()

    result = list(map(
        lambda tag: ({
            "name": tag.name,
            "icon": reverse('user_profile:get_tag_icon', args=(tag.id,)),
        }),
        filter(
            lambda tag: search_param in tag.name.lower() and tag not in user_tags,
            list(Tag.objects.all())
        )
    ))
    result.sort(key=lambda tag: tag["name"].lower())
    return result


@login_required
def search_tags(request):
    """Return the list of tags that match the search.
    The request must contain the following GET parameters:
        tag (str): the search parameter
    The response is in json form which contains the following fields:
        tags (list(dict)): the results returned by the find_tags function above

    Args:
        request (HttpRequest): the request made to this view

    Return:
        JsonResponse: the search result
    """
    try:
        search_param = request.GET["tag"]
        if type(search_param) != str:
            return HttpResponseBadRequest("tag GET parameter malformed")
        result = find_tags(search_param, request.user.user_profile)
        return JsonResponse({
            "tags": result
        })
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("tag GET parameter not found")


def verify_image(img):
    """Check if the given image file is actually an image.
    The input image goes through 4 following checks:
    1. File size check: file size must be smaller than 5MB
    2. Extension check: extension must be jpg/jpeg/png
    3. Content type: image must be of the correct content type
    4. Mime type: image must be of the correct mime type
    5. PIL "verify" method: image must not be detected as broken by PIL

    Args:
        img: image file to be checked

    Returns:
        bool: whether the image file is an image. If it is, return True, otherwise False
    """
    if img.size > settings.UPLOAD_FILE_MAX_SIZE:
        return False
    extension = img.name.split('.')[-1]
    if not extension or extension.lower() not in settings.WHITELISTED_IMAGE_TYPES.keys():
        return False
    if img.content_type not in settings.WHITELISTED_IMAGE_TYPES.values():
        return False
    # mime_type = magic.from_buffer(img.read(1024), mime=True)
    # if mime_type not in settings.WHITELISTED_IMAGE_TYPES.values() and mime_type != img.content_type:
    #     return False
    try:
        pil_img = Image.open(img)
        pil_img.verify()
    except (IOError, SyntaxError):
        return False
    return True


def list_to_image_and_verify_async(uint8list, name):
    img_bytearray = bytearray(uint8list)
    img = ImageFile(io.BytesIO(img_bytearray), name=name)
    try:
        pil_img = Image.open(img)
        pil_img.verify()
    except (IOError, SyntaxError):
        return "not image"
    return img


@login_required
@require_http_methods(["POST"])
def set_profile_image(request):
    """Set profile image for the current user and return the feedback of the result.
    The request method must be post, and the request body must contain a file.
    The file must be sent either in byte array representation of the image, under request.POST,
    or as file data in request.FILES.
    If there is an error raised during image processing, an HttpResponse is returned with status code 405 and explanation for error.

    Args:
        request (HttpRequest): the request made to this view

    Returns:
        HttpResponse: the feedback of the image processing. If successfully, status code is 200. Otherwise, status code is 405.
    """
    try:
        user_profile_obj = request.user.user_profile
        if "img" in request.POST:
            img = list_to_image_and_verify_async(json.loads(request.POST["img"]), request.user.username)
            if img == "not image":
                return HttpResponseBadRequest("not image")
            user_profile_obj.profile_pic = img
            user_profile_obj.save()
            return HttpResponse("success")
        elif "img" in request.FILES:
            img = request.FILES["img"]
            if not verify_image(img):
                return HttpResponseBadRequest("not image")
            user_profile_obj.profile_pic = img
        user_profile_obj.save()
        return HttpResponse("success")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing image (file)")


@login_required
def get_profile_pic(request, username):
    """Obtain the image file of the profile picture of the indicated username.
    Username must be indicated clearly in the URL path.
    The default profile picture will be returned if the user with given username has not uploaded a profile picture.

    Args:
        request (HttpRequest): the request made to this view
        username (str): the username of the user whose profile picture is to be obtained

    Returns:
        FileResponse: the file of the image of the user, wrapped in a FileResponse instance
    """
    if not UserAuth.objects.filter(username=username).exists():
        return HttpResponseNotFound()
    else:
        profile_pic = UserAuth.objects.get(username=username).user_profile.profile_pic
        if not profile_pic:
            return redirect('/static/media/default_profile_pic.jpg')
        else:
            return FileResponse(profile_pic)


@login_required
def get_tag_icon(request, tag_id):
    """Obtain the icon of the tag.
    The tag name must be spelled out clearly in the URL.

    Args:
        request (HttpRequest): the requesst made to this view
        tag_name (str): the name of the tag to obtain

    Return:
        FileResponse: the image of the icon
    """

    if not Tag.objects.filter(id=tag_id).exists():
        return HttpResponseNotFound()
    else:
        icon = Tag.objects.get(id=tag_id).image
        if not icon:
            return redirect('/static/media/default-tag-icon.png')
        else:
            return FileResponse(icon)


@login_required
def change_name(request):
    """Allow a user to change to a new name. Password authentication is required.
    The request body must contain the following fields:
        name: the new name to be adopted
        password: the current password for authentication
    """

    try:
        name = request.POST["name"]
        password = request.POST["password"]

        if len(name) > 15:
            return HttpResponseBadRequest("name too long")

        user = authenticate(username=request.user.username, password=password)
        if request.user != user:
            return HttpResponse("Authentication fails")

        request.user.user_profile.name = name
        request.user.user_profile.save()
        return HttpResponse("Name changed")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")


@login_required
def can_remove_tag(request):
    """Determine if the request user can make a tag removal at this point of time.

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: true if a tag can be removed at this point, else false.
    """
    cooldown = 3600 * 24 * 7 # time in seconds
    return HttpResponse("true" if datetime.now().timestamp() - request.user.user_profile.remove_tag_timestamp >= cooldown else "false")


@login_required
@require_http_methods(["POST"])
def remove_tag(request):
    cooldown = 3600 * 24 * 7 # time in seconds
    if datetime.now().timestamp() - request.user.user_profile.remove_tag_timestamp < cooldown:
        return HttpResponseBadRequest("you are not allowed to remove tag at this point")
    try:
        tag_name = request.POST["tag"]
        tag = Tag.objects.get(name=tag_name)
        if request.user.user_profile.tagList.filter(name=tag_name).exists():
            request.user.user_profile.tagList.remove(tag)
            request.user.user_profile.remove_tag_timestamp = datetime.now().timestamp()
            request.user.user_profile.save()
            return HttpResponse("tag removed")
        else:
            return HttpResponseBadRequest("tag does not belong to you")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("tag field not found")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("tag with provided name not found")


MINIMUM_ACTIVITY_SCORE = 2.0
MAXIMUM_ACTIVITY_SCORE = 5.0
DECREASE_COEFFICIENT = 0.05
DECREASE_EXPONENT = 1.5
DAYS_TO_REACH_LOWEST = 15
SECONDS_IN_A_DAY = 24 * 3600


def get_tag_activity_record(user, tag):
    user_profile = user.user_profile
    record_object = TagActivityRecord.objects.get(user_profile=user_profile, tag=tag)
    return record_object


def change_activity_score(record, change_amount):
    """ Apply a change to the activity score of a user's activity record about a tag.
        - first, the 'decrease with time' will be applied by calling compute final score
        - meaning that the activity score & last activity timestamp of the record will be updated
        - then, the change will be applied

    Args:
        record: the TagActivityRecord object to update
        change_amount: the possibly negative change amount to apply in the activity score
    """
    compute_tag_activity_final_score(record)

    record.activity_score += change_amount
    record.activity_score = max(MINIMUM_ACTIVITY_SCORE, record.activity_score)
    record.activity_score = min(MAXIMUM_ACTIVITY_SCORE, record.activity_score)
    record.save()


def compute_tag_activity_final_score(record):
    """Computes the final score of a tag activity record, counting in decrease with time.
    NOTE: Calling this view will update activity_score and last_activity_timestamp.

    Currently, the final score ranges from 2.0 (minimally active) to 5.0 (absolutely active).
    It takes around 7 days to decrease by 1, and 15 days to decrease from maximum to minimum.

    Args:
        record: the tag activity record to compute for

    Returns: the final score of the record, computed with formula:
        final_score = activity_score - DECREASE_COEFFICIENT * days_since_last_activity ** DECREASE_EXPONENT
    """
    timestamps_since_last_activity = datetime.now().timestamp() - record.last_activity_timestamp
    days_since_last_activity = timestamps_since_last_activity / SECONDS_IN_A_DAY

    if days_since_last_activity > DAYS_TO_REACH_LOWEST or days_since_last_activity < 0:
        record.activity_score = MINIMUM_ACTIVITY_SCORE
        record.last_activity_timestamp = datetime.now().timestamp()
        record.save()
        return MINIMUM_ACTIVITY_SCORE

    final_score = record.activity_score - DECREASE_COEFFICIENT * days_since_last_activity ** DECREASE_EXPONENT
    final_score = max(MINIMUM_ACTIVITY_SCORE, final_score)
    final_score = min(MAXIMUM_ACTIVITY_SCORE, final_score)

    record.activity_score = final_score
    record.last_activity_timestamp = datetime.now().timestamp()
    record.save()

    return final_score


@login_required
def achievements(request, username):
    """Render achievement page.
    # TODO
    """
    if not UserAuth.objects.filter(username=username).exists():
        return HttpResponseNotFound()
    user_auth_obj = UserAuth.objects.get(username=username)
    context = layout_context(user_auth_obj)
    context.update({
        "my_profile": request.user.username == username,
        "is_friend": user_auth_obj.user_log in request.user.user_log.friend_list.all(),
        "is_friend_request_sent": FriendRequest.objects.filter(to_user=request.user.user_log, from_user=user_auth_obj.user_log).exists()
    })
    return render(request, 'user_profile/achievements.html', context)