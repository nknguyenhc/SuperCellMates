from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse, FileResponse
from django.http.response import FileResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.decorators import login_required
from .models import UserProfile
from user_auth.models import UserAuth, Tag
import io
from django.core.files.images import ImageFile
from django.views.decorators.http import require_http_methods

from user_auth.models import Tag


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

    tags = list(map(
        lambda tag: ({
            "name": tag.name,
            "icon": reverse('user_profile:get_tag_icon', args=(tag.name,)),
        }),
        list(user_auth_obj.user_profile.tagList.all())
    ))
    result = {
        "tags": tags,
        "my_profile": True,
        "is_admin": user_auth_obj.is_superuser
    }
    result.update(layout_context(user_auth_obj))
    return result


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
        tags: the list of tags (in string form, e.g. "['Mathematics', 'Physics']") to be added, each element is a string representing the tag
    
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
        requested_tags = request.POST["tags"].strip("[]").split(",")
        for i in range(count):
            user_profile_obj.tagList.add(Tag.objects.get(name=requested_tags[i]))
        return HttpResponse("success")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ValueError:
        return HttpResponseBadRequest("tags value is not in proper list format / count submitted is not integer")
    except IndexError:
        return HttpResponseBadRequest("number of tags submitted is smaller than tag count")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("one of the tag names is malformed")


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
    The response is in the form of json, which consists of one field "tags".
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
        "icon": reverse('user_profile:get_tag_icon', args=(tag.name,)),
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
    
    Args:
        search_param (str): the search parameter
        user_profile_obj (UserProfile): the instance of UserProfile that represents the user making this search.
    
    Returns:
        list(dict): the list of tags that match the search parameter
    """

    user_tags = set(user_profile_obj.tagList.all())
    search_param = search_param.lower()
    
    return list(map(
        lambda tag: ({
            "name": tag.name,
            "icon": reverse('user_profile:get_tag_icon', args=(tag.name,)),
        }),
        filter(
            lambda tag: search_param in tag.name.lower() and tag not in user_tags,
            list(Tag.objects.all())
        )
    ))


@login_required
def search_tags(request):
    """Return the list of tags the match the search.
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
        result = find_tags(search_param, request.user.user_profile)
        return JsonResponse({
            "tags": result
        })
    except AttributeError:
        return HttpResponseBadRequest("GET parameters not found")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("tag GET parameter not found")


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
            img_bytearray = request.POST["img"].strip("[]").split(", ")
            img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
            img = ImageFile(io.BytesIO(img_bytearray), name=request.user.username)
            user_profile_obj.profile_pic = img
        elif "img" in request.FILES:
            img = request.FILES["img"]
            user_profile_obj.profile_pic = img
        # TODO: check if the file submitted is of correct format
        user_profile_obj.save()
        return HttpResponse("success")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data/image file")


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
def get_tag_icon(request, tag_name):
    """Obtain the icon of the tag.
    The tag name must be spelled out clearly in the URL.

    Args:
        request (HttpRequest): the requesst made to this view
        tag_name (str): the name of the tag to obtain
    
    Return:
        FileResponse: the image of the icon
    """

    if not Tag.objects.filter(name=tag_name).exists():
        return HttpResponseNotFound()
    else:
        icon = Tag.objects.get(name=tag_name).image
        if not icon:
            return redirect('/static/media/default-tag-icon.png')
        else:
            return FileResponse(icon)