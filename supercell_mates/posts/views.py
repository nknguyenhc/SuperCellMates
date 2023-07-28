from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, FileResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.exceptions import ObjectDoesNotExist
import io
from django.core.files.images import ImageFile
from datetime import datetime
import json

from user_profile.views import verify_image, list_to_image_and_verify_async, \
    get_tag_activity_record, change_activity_score, MAXIMUM_ACTIVITY_SCORE

from user_log.views import compute_matching_index

from user_auth.models import Tag, UserAuth
from .models import Post, PostImage

CREATE_POST_TAG_ACTIVITY_COEFFICIENT = 0.5
DELETE_POST_MAXIMUM_PUNISHMENT = -1


@login_required
@require_http_methods(["POST"])
def create_post(request):
    """Create a post via request post method.
    The request body must be of form data, and contains the following fields:
        title (compulsory): the title of the post.
        content (compulsory): the text content of the post.
        tag (compulsory): the tag name associated with this post. There can only be one tag associated
        imgs (optional): the list of images associated with this post.
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
        if len(title) > 100:
            return HttpResponseBadRequest("title too long")
        if len(content) > 2000:
            return HttpResponseBadRequest("content too long")

        # tag
        tag_name = request.POST["tag"]
        tag_object = Tag.objects.get(name=tag_name)
        if tag_object not in request.user.user_profile.tagList.all():
            return HttpResponseBadRequest("tag submitted does not belong to user")

        # visibility
        visibility = get_list_from_request_body(request, "visibility")
        friend_visible = "friends" in visibility
        tag_visible = "tag" in visibility
        public_visible = "public" in visibility
        if not friend_visible and not tag_visible and not public_visible:
            return HttpResponseBadRequest("visibility malformed")
        
        post = Post(
            title=title, 
            content=content, 
            tag=tag_object, 
            friend_visible=friend_visible, 
            tag_visible=tag_visible, 
            public_visible=public_visible,
            creator=request.user.user_log,
            time_posted=datetime.now().timestamp()
        )
        post.save()

        # images
        if "imgs" in request.POST:
            imgs = json.loads(request.POST["imgs"])
            # do not change the method of getting the list of imgs

            if len(imgs) > 9:
                return HttpResponseBadRequest("too many images")
            for (i, img_uint8list) in enumerate(imgs):
                img = list_to_image_and_verify_async(img_uint8list, request.user.username)
                if img == "not image":
                    return HttpResponseBadRequest("not image")
                img_obj = PostImage(order=i, image=img, post=post)
                img_obj.save()
        else:
            imgs = request.FILES.getlist("imgs")
            if len(imgs) > 9:
                return HttpResponseBadRequest("too many images")
            for (i, img) in enumerate(imgs):
                if not verify_image(img):
                    return HttpResponseBadRequest("not image")
                img_obj = PostImage(order=i, image=img, post=post)
                img_obj.save()
        post.img_count = len(imgs)
        post.save()

        # update tag activity
        record_obj = get_tag_activity_record(request.user, tag_object)
        change_amount = CREATE_POST_TAG_ACTIVITY_COEFFICIENT * (MAXIMUM_ACTIVITY_SCORE - record_obj.activity_score)
        change_activity_score(record_obj, change_amount)

        return HttpResponse("post created")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("tag or tag activity record not found")
    except TypeError:
        return HttpResponseBadRequest("imgs key submitted is not of type array")


def get_list_from_request_body(request, key):
    """Used when the request body contains a value of list type.
    For web version, the value is passed as FormData, and can be retrieved directly using getlist.
    For mobile version, the value is encoded as FormURL. It becomes a String after decoding.

    Representation of the value in frontend:
        - POST request from mobile: the original list representation (e.g. tagList = ["tag1", "tag2"])
        - POST request from web: the original list representation
        - GET request from mobile: a string separated by comma (e.g. tagList = "tag1,tag2")
        - GET request from web: duplicate keys in query dict (e.g. url?tagList=tag1&tagList=tag2)

    Args:
        request (HttpRequest): the request made to this view
        key: the key of the entry that contains a list in the value

    Returns:
        the list value passed from frontend, or
        HttpBadRequest, when the keys for both versions are absent

    """
    if request.method == 'POST':
        if key in request.POST:
            return request.POST.getlist(key)
        elif f'{key}_async' in request.POST:
            return request.POST[f'{key}_async'].strip('[]').split(", ")
        else:
            return HttpResponseBadRequest("request body is missing an important key")
    elif request.method == 'GET':
        if key in request.GET:
            return request.GET.getlist(key)
        elif f'{key}_async' in request.GET:
            return request.GET[f'{key}_async'].split(",")
        else:
            return HttpResponseBadRequest("request body is missing an important key")
    else:
        return HttpResponseBadRequest("request is malformed")


@login_required
@require_http_methods(["POST"])
def edit_post(request, post_id):
    """Allow user to edit the post, with the new information given in the body, except images will not be received. 
    Removing/adding photos to posts are handled in a separate view.
    Tag will not be changed.
    All old images will be deleted, frontend needs to keep track of the old images
    Required fields in the form data of the request:
        title: the new title of the post
        content: the new content of the post
        visibility: the new visibility list of the post
        imgs: the list of new images attached to this post
    
    Args:
        request (HttpRequest): the request made to this view
        post_id: the id of the post
    
    Returns:
        HttpResponse: the feedback of the process
    """

    try:
        post = Post.objects.get(id=post_id)
        if not post in request.user.user_log.posts.all():
            return HttpResponseBadRequest("post with provided id does not belong to you")

        # basic info: title and content
        title = request.POST["title"]
        content = request.POST["content"]
        if title == '' or content == '':
            return HttpResponseBadRequest("title or content is empty")
        if len(title) > 100:
            return HttpResponseBadRequest("title too long")
        if len(content) > 2000:
            return HttpResponseBadRequest("content too long")

        # visibility
        visibility = get_list_from_request_body(request, "visibility")
        friend_visible = "friends" in visibility
        tag_visible = "tag" in visibility
        public_visible = "public" in visibility
        if not friend_visible and not tag_visible and not public_visible:
            return HttpResponseBadRequest("visibility malformed")
        
        post.title = title
        post.content = content
        post.friend_visible = friend_visible
        post.tag_visible = tag_visible
        post.public_visible = public_visible
        
        # images
        for img in post.images.all():
            img.delete()
        if "imgs" in request.POST:
            imgs = json.loads(request.POST["imgs"])

            for i, img_uint8list in enumerate(imgs):
                img = list_to_image_and_verify_async(img_uint8list, request.user.username)
                if img == "not image":
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
        post.img_count = len(imgs)
        post.save()

        return HttpResponse("post updated")

    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("post with provided id not found")


# @login_required
# @require_http_methods(["POST"])
# def add_photo(request):
#     """Attempt to add one photo associated with a given post.
#     The photo is given in the "img" field, either in request.POST as binary or request.FILES as file.
#     The post is given by the "post_id" field in request.POST .
#     The view checks whether the request user is the owner of the post first before making edits to the post.

#     Args:
#         request (HttpRequest): the request made to this view
    
#     Returns:
#         HttpResponse: the URL to the image, or the feedback of the process if failed
#     """

#     try:
#         post_id = request.POST["post_id"]
#         post = Post.objects.get(id=post_id)
#         if not post in request.user.user_log.posts.all():
#             return HttpResponseBadRequest("you are not the owner of this post")
#         if "img" in request.POST:
#             img_raw = request.POST["img"]
#             img_bytearray = img_raw.strip("[]").split(", ")
#             img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
#             img = ImageFile(io.BytesIO(img_bytearray), name=request.user.username)
#             if not verify_image(img):
#                 return HttpResponseBadRequest("not image")
#         else:
#             img = request.FILES["img"]
#             if not verify_image(img):
#                 return HttpResponseBadRequest("not image")
#         img_obj = PostImage(order=post.img_count, image=img, post=post)
#         img_obj.save()
#         post.img_count += 1
#         post.save()
#         return HttpResponse(reverse("posts:get_post_pic", args=(img_obj.id,)))
    
#     except MultiValueDictKeyError:
#         return HttpResponseBadRequest("request does not contain an important key")
#     except ObjectDoesNotExist:
#         return HttpResponseBadRequest("post with provided id not found")


# @login_required
# @require_http_methods(["POST"])
# def delete_photo(request):
#     """Attempt to delete a post photo from the database.
#     The request body contains the following fields:
#         post_id: the id of the post
#         pic_id: the id of the pic
#     The view checks whether the request user is the owner of the post before deleting the photo.

#     Args:
#         request (HttpRequest): the request made to this view
    
#     Returns:
#         HttpResponse: the feedback of the process
#     """
#     try:
#         post_id = request.POST["post_id"]
#         pic_id = request.POST["pic_id"]
#         post = Post.objects.get(id=post_id)
#         if post not in request.user.user_log.posts.all():
#             return HttpResponseBadRequest("you are not the owner of this post")
#         pic = PostImage.objects.get(id=pic_id)
#         pic.delete()
#         return HttpResponse("picture deleted")
    
#     except MultiValueDictKeyError:
#         return HttpResponseBadRequest("request body does not contain an important key")
#     except ObjectDoesNotExist:
#         return HttpResponseBadRequest("picture with given id/post with given id not found")


@login_required
@require_http_methods(["POST"])
def delete_post(request):
    """Attempts to delete the post
    The body must contain the "post_id" field, which is the id of the post to delete.
    This view checks whether the request user is the owner of the post first before deleting.

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process
    """
    try:
        post_id = request.POST["post_id"]
        post = Post.objects.get(id=post_id)
        if post not in request.user.user_log.posts.all():
            return HttpResponseBadRequest("you are not the owner of this post")

        # update tag activity, decreasing at most DELETE_POST_MAXIMUM_PUNISHMENT
        tag_obj = post.tag
        record_obj = get_tag_activity_record(request.user, tag_obj)
        change_amount = CREATE_POST_TAG_ACTIVITY_COEFFICIENT / (1 - CREATE_POST_TAG_ACTIVITY_COEFFICIENT) *\
            (record_obj.activity_score - MAXIMUM_ACTIVITY_SCORE)
        change_amount = max(DELETE_POST_MAXIMUM_PUNISHMENT, change_amount)
        change_activity_score(record_obj, change_amount)

        post.delete()
        return HttpResponse("post deleted")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body does not contain an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("post or tag activity record not found")


def parse_post_object(post, user_auth_viewer):
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
            public_visible, friend_visible, tag_visible: follow the convention set in the create_post view
            creator: a dictionary representing the creator of the post, with the following fields:
                name: the name of the creator
                username: the username of the creator
                profile_pic_url: the URL to the profile pic of the creator
                profile_link: the link to the profile of the creator
            time_posted: the time posted given in epoch time (in seconds)
            images: the list of URL to the images of the post
    """
    images = list(PostImage.objects.filter(post=post))
    images.sort(key=lambda image:image.order)
    images = list(map(
        lambda image: reverse("posts:get_post_pic", args=(image.id,)),
        images
    ))

    ret = {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "tag": {
            "name": post.tag.name,
            "icon": reverse("user_profile:get_tag_icon", args=(post.tag.id,)),
        },
        "public_visible": post.public_visible,
        "friend_visible": post.friend_visible,
        "tag_visible": post.tag_visible,
        "creator": {
            "name": post.creator.user_profile.name,
            "username": post.creator.user_auth.username,
            "profile_pic_url": reverse("user_profile:get_profile_pic", args=(post.creator.user_auth.username,)),
            "profile_link": reverse("user_log:view_profile", args=(post.creator.user_auth.username,)),
        },
        "time_posted": post.time_posted,
        "images": images,
        "can_reply": post.creator.friend_list.filter(user_auth=user_auth_viewer).exists(),
    }

    if post.creator != user_auth_viewer:
        ret.update({
            "matching_index": compute_matching_index(post.creator, user_auth_viewer)
        })

    return ret


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
        post_object = Post.objects.get(id=post_id)
        if has_access(request.user, post_object):
            post_dict = parse_post_object(post_object, request.user)
            return JsonResponse(post_dict)
        else:
            return HttpResponseNotFound()
    
    except ObjectDoesNotExist:
        return HttpResponseNotFound()


@login_required
def display_post(request):
    return render(request, "posts/display.html")


@login_required
def get_post_pic(request, pic_id):
    """Return the picture with the given id.
    This view checks the user privilege to the post first before returning the image.
    If the user does not have privilege, or there is no picture with the given id, return not found.

    Args:
        request (HttpRequest): the request made to this view
        pic_id (str): the id of the post picture
    
    Returns:
        FileResponse / HttpResponseNotFound: the picture, or response not found
    """
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
        start (str): epoch time of start time in seconds
        end (str): epoch time of end time in seconds
        [Optional] tag (str): the string of the tag filter applied to the profile posts
    
    The returned json response contains the following fields:
        posts (list(dict)): the list of posts, each represented by a dictionary
        next (int): the time stamp of the next older post, 0 if there is no older post
        myProfile (bool): whether the request user has the username
    """

    try:
        if "start" in request.GET:
            start_time = float(request.GET["start"])
            end_time = float(request.GET["end"])
        else:
            start_time = datetime.now().timestamp() - 3600 * 24
            end_time = datetime.now().timestamp()
        user_log_obj = UserAuth.objects.get(username=username).user_log

        posts_queryset = user_log_obj.posts.filter(time_posted__range=(start_time, end_time)).order_by('-time_posted')

        if "tag" in request.GET:
            tag = Tag.objects.get(name=request.GET["tag"])
            posts_queryset = posts_queryset.filter(tag=tag)

        posts = list(map(
            lambda post: parse_post_object(post, request.user),
            filter(
                lambda post: has_access(request.user, post),
                list(posts_queryset.all())
            )
        ))

        older_posts = user_log_obj.posts.filter(time_posted__lt=start_time).order_by("-time_posted")
        next_last_timestamp = 0
        if older_posts.exists():
            next_last_timestamp = older_posts.first().time_posted

        return JsonResponse({
            "posts": posts,
            "next": next_last_timestamp,
            "myProfile": request.user.username == username,
        })
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("start date provided but end date not found in GET parameter")
    except ObjectDoesNotExist:
        return HttpResponseNotFound("user with the username not found / tag with requested tag not found")
    except ValueError:
        return HttpResponseBadRequest("time fields containing characters other than numbers / invalid time")
    except OSError:
        return HttpResponseBadRequest("time requested is invalid epoch time")

@login_required
@ensure_csrf_cookie
def get_home_feed(request):
    """Return the posts accessible in a user's home feed, excluding their own posts

    Args:
        request (HttpRequest): the request made to this view

    The request must contain the following query fields:
        - sort (str): the sorting method applied by user
        - friend_filter ('1'/'0'): whether user filters home feed to friends only
        - tag_filter('1'/'0'): whether user filters home feed to their tags only
        - limit (str): the maximum number of posts to return

    If sort is "time", the request must contain:
        - start_timestamp (int): epoch time in seconds of the post to start displaying from (excluding), or empty string if fetching post from current time
            When entering home feed for the first time, start_timestamp should be ""
            When trying to load more posts, use the previously returned stop_timestamp as the new start_timestamp

    If sort is "matching_index", the request must contain:
        - start_matching_index (str): the exact matching index of the post to start displaying from
            When entering home feed for the first time, start_matching_index should be "5"
            When trying to load more posts, use the previous stop_matching_index as the new start_matching_index

    Returns:
        JsonResponse containing post data, or HttpResponseBadRequest

    The jsonResponse contains:
        - posts (list(dict)): the list of posts, each represented by a dictionary

    If sort is "time", the response also contains:
        - stop_timestamp (str): the epoch time of the last post in the list of posts, if none is found, this field is 0

    If sort is "matching_index", the response also contains:
        - stop_matching_index (str): the matching index between user and the creator of the last post
    """
    try:
        posts = Post.objects

        # apply filters
        # posts = posts.exclude(creator=request.user.user_log)
        if request.GET["friend_filter"] == '1':
            friend_list = request.user.user_log.friend_list.all()
            posts = posts.filter(creator__in=friend_list)
        if request.GET["tag_filter"] == '1':
            tag_list = request.user.user_profile.tagList.all()
            posts = posts.filter(tag__in=tag_list)

        count = 0
        result = []

        # Sort, then take accessible posts until limit is reached
        if request.GET["sort"] == "time":
            if request.GET["start_timestamp"] != "":
                start_timestamp = float(request.GET["start_timestamp"])
                posts = posts.filter(time_posted__lt=start_timestamp)
            posts = posts.order_by('-time_posted')
            for post_object in posts:
                if has_access(request.user, post_object):
                    result.append(parse_post_object(post_object, request.user))
                    count += 1
                    if count >= int(request.GET["limit"]):
                        break
            ret = {
                "posts": result,
                "stop_timestamp": 0
            }
            if count > 0:
                ret["stop_timestamp"] = result[count-1]["time_posted"]
        # TODO: sort by matching index
        else:
            return HttpResponseBadRequest("sort method query string malformed")

        return JsonResponse(ret)

    except MultiValueDictKeyError:
        return HttpResponseBadRequest("certain field(s) not found in GET parameter")
    except ValueError:
        return HttpResponseBadRequest("start_time provided is not a number / limit provided is not an integer")
    except OSError:
        return HttpResponseBadRequest("start_time provided is not epoch time in seconds")