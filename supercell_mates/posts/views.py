from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, FileResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist
import datetime
from pytz import timezone

from user_profile.views import verify_image

from user_auth.models import Tag, UserAuth
from .models import Post, PostImage


@login_required
@require_http_methods(["POST"])
def create_post(request):
    """Create a post via request post method.
    The request body must be of form data, and contains the following fields:
        title (compulsory): the title of the post.
        content (compulsory): the text content of the post.
        tag (compulsory): the tag name associated with this post. There can only be one tag associated
        images (optional): the list of images associated with this post.
        visibility (compulsory): the list of the visibility options. Values:
            "public": the post is visible to public
            "friends": the post is visible to friends
            "tag": the post is visible to the people of same tags
            if "public" is True, the other two options do not mean anything
            if "public" is False and both "friends" and "tag" are true,
            the post is only available to friends with the same tag
            if "public" is False and only one of "friends" and "tag" is true,
            the post is available to friends/people of same tag respectively
        
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process. 
        If user input is not handled properly in frontend, return status code 400
    """

    try:
        # basic info: title and content
        title = request.POST["title"]
        content = request.POST["content"]
        if title == '' or content == '':
            return HttpResponseBadRequest("title or content is empty")

        # tag
        tag_name = request.POST["tag"]
        tag_object = Tag.objects.get(name=tag_name)
        if tag_object not in request.user.user_profile.tagList.all():
            return HttpResponseBadRequest("tag submitted does not belong to user")

        # visibility
        visibility = request.POST.getlist("visibility")
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

        # images
        if "imgs" in request.POST:
            # do not change the method of getting the list of imgs
            imgs = request.POST.getlist("imgs")
            for (i, img_raw) in enumerate(imgs):
                img_bytearray = img_raw.strip("[]").split(", ")
                img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
                img = ImageFile(io.BytesIO(img_bytearray), name=request.user.username)
                if not verify_image(img):
                    return HttpResponseBadRequest("not image")
                img_obj = PostImage(order=i, image=img, post=post)
                img_obj.save()
        else:
            imgs = request.FILES.getlist("imgs")
            for (i, img) in enumerate(imgs):
                if not verify_image(img):
                    return HttpResponseBadRequest("not image")
                img_obj = PostImage(order=i, image=img, post=post)
                img_obj.save()
        
        return HttpResponse("post created")
    
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("tag with provided name not found")
    except TypeError:
        return HttpResponseBadRequest("imgs key submitted is not of type array")


def parse_post_object(post):
    """Return the information of the post by a dict.

    Args:
        post (Post): post in the database
    
    Returns:
        (dict): the information of the post, with the following fields:
            id: the id of the post in the database
            title: the title of the post
            content: the content of the post
            tag: the tag of the post, represented by a dictionary with the following fields:
                name: the name of the tag
                icon: the link to the icon of the tag
            creator: a dictionary representing the creator of the post, with the following fields:
                name: the name of the creator
                username: the username of the creator
                profile_pic_url: the URL to the profile pic of the creator
                profile_link: the link to the profile of the creator
            time_posted: the time posted given in a dictionary with the following fields:
                year (int)
                month (int)
                day (int)
                hour (int)
                minute (int)
                second (int)
            images: the list of URL to the images of the post
    """
    images = list(PostImage.objects.filter(post=post))
    images.sort(key=lambda image:image.order)
    images = list(map(
        lambda image: reverse("posts:get_post_pic", args=(image.id,)),
        images
    ))

    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "tag": {
            "name": post.tag.name,
            "icon": reverse("user_profile:get_tag_icon", args=(post.tag.name,)),
        },
        "creator": {
            "name": post.creator.user_profile.name,
            "username": post.creator.user_auth.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(post.creator.user_auth.username,)),
            "profile_link": reverse("user_log:view_profile", args=(post.creator.user_auth.username,)),
        },
        "time_posted": {
            "year": post.time_posted.year,
            "month": post.time_posted.month,
            "day": post.time_posted.day,
            "hour": post.time_posted.hour,
            "minute": post.time_posted.minute,
            "second": post.time_posted.second,
        },
        "images": images
    }


def has_access(user_auth_obj, post):
    """Determine if the user represented by the user auth object has privilege to view the post.

    Args:
        user_auth_obj (UserAuth): the UserLog instance representing the user
        post (Post): the post in the database
    
    Returns:
        bool: True if the user has access to view the post, false otherwise
    """
    if user_auth_obj == post.creator.user_auth:
        return True
    
    if post.public_visible:
        return True
    
    if post.friend_visible:
        if post.tag_visible:
            return user_auth_obj.user_log in post.creator.friend_list.all() and post.tag in user_auth_obj.user_profile.tagList.all()
        else:
            return user_auth_obj.user_log in post.creator.friend_list.all()
    elif post.tag_visible:
        return post.tag in user_auth_obj.user_profile.tagList.all()


@login_required
def get_post(request, post_id):
    """Return the data of the post in the form of JsonResponse.
    The view checks the privilege of the request user. If the request user has enough privilege, return the json response.
    Otherwise, return http response status code 404.
    The information of the post is determined by the parse_post_object function above

    Args:
        request (HttpRequest): the request made to this view
        post_id (str): the id of the post
    
    Returns:
        JsonResponse: the post data
    """
    try:
        if has_access(request.user, post):
            post_object = Post.objects.get(id=post_id)
            post_dict = parse_post_object(post_object)
            return JsonResponse(post_dict)
        else:
            return HttpResponseNotFound()
    
    except ObjectDoesNotExist:
        return HttpResponseNotFound()


@login_required
def get_post_pic(request, pic_id):
    try:
        image_obj = PostImage.objects.get(id=pic_id)
        if has_access(request.user, image_obj.post):
            return FileResponse(image_obj.image)
        else:
            return HttpResponseNotFound()
    except ObjectDoesNotExist:
        return HttpResponseNotFound()


@login_required
def get_profile_posts(request, username):
    """Return the posts of the user with the given username within a time frame.
    The time limits are given in the GET parameters. The URL therefore must contain the following GET paramters:
        start (str): the string of the start date given in the format YYYY-MM-DD-HH-MM-SS
        end (str): the string of the end date given in the format YYYY-MM-DD-HH-MM-SS
    """

    try:
        start_arr = request.GET["start"].split("-")
        end_arr = request.GET["end"].split("-")
        if len(start_arr) != 6 or len(end_arr) != 6:
            return HttpResponseBadRequest("start or end date malformed")
        start_time = datetime.datetime(year=int(start_arr[0]), month=int(start_arr[1]), day=int(start_arr[2]), hour=int(start_arr[3]), minute=int(start_arr[4]), second=int(start_arr[5]))
        end_time = datetime.datetime(year=int(end_arr[0]), month=int(end_arr[1]), day=int(end_arr[2]), hour=int(end_arr[3]), minute=int(end_arr[4]), second=int(end_arr[5]))
        # only meant to be in SG. If post is made at another point of the world, have to fix this time display
        user_log_obj = UserAuth.objects.get(username=username).user_log

        posts = list(map(
            lambda post: parse_post_object(post),
            filter(
                lambda post: has_access(request.user, post),
                list(user_log_obj.posts.filter(time_posted__range=(start_time, end_time)).all())
            )
        ))
        posts.reverse()
        return JsonResponse({
            "posts": posts
        })
    
    except AttributeError:
        return HttpResponseBadRequest("GET parameter(s) malformed")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("start or end date not found in GET parameter")
    except ObjectDoesNotExist:
        return HttpResponseNotFound("user with the username not found")
    except ValueError:
        return HttpResponseBadRequest("time fields containing characters other than numbers / invalid time")