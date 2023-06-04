from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, FileResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist

from user_auth.models import Tag
from .models import Post, PostImage


@login_required
@require_http_methods(["POST"])
def create_post(request):
    """Create a post via request post method.
    The request body must be of form data, and contains the following fields:
        title (optional): the title of the post.
        content (compulsory): the text content of the post.
        tag (compulsory): the tag name associated with this post. There can only be one tag associated
        images (optional): the list of images associated with this post.
        visibility (compulsory): the list of the visibility options. Values:
            "public": the post is visible to public
            "friend": the post is visible to friends
            "tag": the post is visible to the people of same tags
            if "public" is True, the other two options do not mean anything
            if "public" is False and both "friend" and "tag" are true,
            the post is only available to friends with the same tag

    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process. 
        If user input is not handled properly in frontend, return status code 400
    """

    try:
        title = request.POST["title"]
        content = request.POST["content"]

        tag_name = request.POST["tag"]
        tag_object = Tag.objects.get(name=tag_name)
        if tag_object not in request.user.user_profile.tagList.all():
            return HttpResponseBadRequest("tag submitted does not belong to user")

        visibility = request.POST["visibility"]
        visibility = set(visibility.strip("[]").split(","))
        friend_visible = False
        tag_visible = False
        public_visible = False
        if "public" in visibility:
            public_visible = True
        if "friends" in visibility:
            friend_visible = True
        if "tag" in visibility:
            tag_visible = True
        if not friend_visible and not tag_visible and not public_visible:
            return HttpResponseBadRequest("visibility malformed")
        
        post = Post(
            title=title, 
            content=content, 
            tag=tag_object, 
            friend_visible=friend_visible, 
            tag_visible=tag_visible, 
            public_visible=public_visible,
            creator=request.user.user_log
        )
        post.save()
        return HttpResponse("post created")
    
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("tag with provided name not found")


def get_post(request, post_id):
    """Return the data of the post in the form of JsonResponse.
    The view checks the privilege of the request user. If the request user has enough privilege, return the json response.
    Otherwise, return http response status code 404.
    The response contain the following fields:
        title: the title of the post
        content: the content of the post
        tag: the tag of the post, represented by a dictionary with the following fields:
            name: the name of the tag
            icon: the link to the icon of the tag
        creator name: the name of the creator
        creator username: the username of the creator

    Args:
        request (HttpRequest): the request made to this view
        post_id (str): the id of the post
    
    Returns:
        JsonResponse: the post data
    """
    try:
        post = Post.objects.get(id=post_id)
        post_object = {
            "title": post.title,
            "content": post.content,
            "tag": {
                "name": post.tag.name,
                "icon": reverse("user_profile:get_tag_icon", args=(post.tag.name,)),
            },
            "creator_name": post.creator.user_profile.name,
            "creator_username": post.creator.user_auth.username,
        }
        if request.user == post.creator.user_auth:
            return JsonResponse(post_object)

        if post.public_visible:
            return JsonResponse(post_object)
        elif not request.user.is_authenticated:
            return HttpResponseNotFound()
        
        if post.friend_visible:
            if post.tag_visible:
                if request.user.user_log in post.creator.friend_list.all() and post.tag in request.user.user_profile.tagList.all():
                    return JsonResponse(post_object)
                else:
                    return HttpResponseNotFound()
            else:
                if request.user.user_log in post.creator.friend_list.all():
                    return JsonResponse(post_object)
                else:
                    return HttpResponseNotFound()
        elif post.tag_visible:
            if post.tag in request.user.user_profile.tagList.all():
                return JsonResponse(post_object)
            else:
                return HttpResponseNotFound()
        return HttpResponseNotFound()
    
    except ObjectDoesNotExist:
        return HttpResponseNotFound()