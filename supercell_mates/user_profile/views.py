from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.http.response import FileResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.contrib.auth.decorators import login_required
from .models import UserProfile
from user_auth.models import UserAuth, Tag
import io
from django.core.files.images import ImageFile
from django.views.decorators.http import require_http_methods


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
            tags: the list of tags of the current user. Each tag is represented by a dictionary with the field 'name',
            whose corresponding value is the name of the tag.
            my_profile: whether the target user to be rendered on the template is the same as request user, True by default
            is_admin: whether the current user is an admin of this website, True if it is, False otherwise
    """

    tags = list(map(
        lambda tag: ({
            "name": tag.name
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
        tags: the list of tags (in string form, e.g. '[1, 3, 4]') to be added, each element is a number representing the id of the tag to be added
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: feedback of whether the tags were added successfully.
        Status code is 200 only when it is successfully, otherwise status code 405 is returned with the text as explanation for the error.
    """

    try:
        user_profile_obj = request.user.user_profile
        count = request.POST["count"]
        requested_tags = request.POST["tags"].strip("[]").split(",")
        for i in range(int(count)):
            user_profile_obj.tagList.add(Tag.objects.get(id=requested_tags[i]))
        return HttpResponse("success")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ValueError:
        return HttpResponseBadRequest("tags value is not in proper list format")
    except IndexError:
        return HttpResponseBadRequest("number of tags submitted is smaller than tag count")


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
    """Return the list of currently available tags and respective indications of whether the current user has the tags.
    The response is in the form of json, which consists of one field "tags".
    The corresponding value is the list of currently available tags.
    Each tag (element) has the following fields:
        tag_id (int): the id of the tag stored in the database
        tag_name (str): the string representation of this tag
        in (bool): whether the tag is in the list of tags of the currently logged in user, True if it is, False otherwise
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        JsonResponse: response containing the list of currently available tags and indication of whether the current user has the tags
    """
    
    user_profile = request.user.user_profile
    tagList = set(user_profile.tagList.all())
    tags = list(Tag.objects.all())
    tags = list(map(lambda tag: {
        "tag_id": tag.id,
        "tag_name": tag.name,
        "in": tag in tagList
    }, tags))
    return JsonResponse({
        "tags": tags
    })


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
        else:
            img = request.FILES["img"]
        # TODO: check if the file submitted is of correct format
        user_profile_obj.profile_pic = img
        user_profile_obj.save()
        return HttpResponse("success")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data/image file")
    except MultiValueDictKeyError:
        return HttpResponse("image not submitted")


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
        return HttpResponseBadRequest("username not found")
    else:
        profile_pic = UserAuth.objects.get(username=username).user_profile.profile_pic
        if not profile_pic:
            return redirect('/static/media/default_profile_pic.jpg')
        else:
            return FileResponse(profile_pic)
