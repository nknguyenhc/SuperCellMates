from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.utils.datastructures import MultiValueDictKeyError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, FileResponse
from django.views.decorators.http import require_http_methods
from django.core.exceptions import ObjectDoesNotExist
import io
from django.core.files.images import ImageFile
from PIL import Image
from datetime import datetime, timedelta

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
            creator=request.user.user_log
        )
        post.save()

        # images
        if "imgs" in request.POST:
            # do not change the method of getting the list of imgs
            if request.POST["imgs"] == '[]':
                imgs = []
            else:
                imgs = request.POST["imgs"].strip('[[]]').split('], [')
                if len(imgs) > 9:
                    return HttpResponseBadRequest("too many images")
                for (i, img_raw) in enumerate(imgs):
                    img_bytearray = img_raw.split(", ")
                    img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
                    img = ImageFile(io.BytesIO(img_bytearray), name=request.user.username)
                    try:
                        pil_img = Image.open(img)
                        pil_img.verify()
                    except (IOError, SyntaxError):
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

        return HttpResponse("post created")
    
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("tag with provided name not found")
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

    # try:
    post = Post.objects.get(id=post_id)
    if not post in request.user.user_log.posts.all():
        return HttpResponseBadRequest("post with provided id does not belong to you")

    # basic info: title and content
    title = request.POST["title"]
    content = request.POST["content"]
    if title == '' or content == '':
        return HttpResponseBadRequest("title or content is empty")

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
        if request.POST["imgs"] == '[]':
            imgs = []
        else:
            imgs = request.POST["imgs"].strip('[[]]').split('], [')
            for (i, img_raw) in enumerate(imgs):
                img_bytearray = img_raw.split(", ")
                img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
                img = ImageFile(io.BytesIO(img_bytearray), name=request.user.username)
                try:
                    pil_img = Image.open(img)
                    pil_img.verify()
                except (IOError, SyntaxError):
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

    # except AttributeError:
    #     return HttpResponseBadRequest("request does not contain form data")
    # except MultiValueDictKeyError:
    #     return HttpResponseBadRequest("request body is missing an important key")
    # except ObjectDoesNotExist:
    #     return HttpResponseBadRequest("post with provided id not found")


@login_required
@require_http_methods(["POST"])
def add_photo(request):
    """Attempt to add one photo associated with a given post.
    The photo is given in the "img" field, either in request.POST as binary or request.FILES as file.
    The post is given by the "post_id" field in request.POST .
    The view checks whether the request user is the owner of the post first before making edits to the post.

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the URL to the image, or the feedback of the process if failed
    """

    try:
        post_id = request.POST["post_id"]
        post = Post.objects.get(id=post_id)
        if not post in request.user.user_log.posts.all():
            return HttpResponseBadRequest("you are not the owner of this post")
        if "img" in request.POST:
            img_raw = request.POST["img"]
            img_bytearray = img_raw.strip("[]").split(", ")
            img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
            img = ImageFile(io.BytesIO(img_bytearray), name=request.user.username)
            if not verify_image(img):
                return HttpResponseBadRequest("not image")
        else:
            img = request.FILES["img"]
            if not verify_image(img):
                return HttpResponseBadRequest("not image")
        img_obj = PostImage(order=post.img_count, image=img, post=post)
        img_obj.save()
        post.img_count += 1
        post.save()
        return HttpResponse(reverse("posts:get_post_pic", args=(img_obj.id,)))
    
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data/image")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request does not contain an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("post with provided id not found")


@login_required
@require_http_methods(["POST"])
def delete_photo(request):
    """Attempt to delete a post photo from the database.
    The request body contains the following fields:
        post_id: the id of the post
        pic_id: the id of the pic
    The view checks whether the request user is the owner of the post before deleting the photo.

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process
    """
    try:
        post_id = request.POST["post_id"]
        pic_id = request.POST["pic_id"]
        post = Post.objects.get(id=post_id)
        if post not in request.user.user_log.posts.all():
            return HttpResponseBadRequest("you are not the owner of this post")
        pic = PostImage.objects.get(id=pic_id)
        pic.delete()
        return HttpResponse("picture deleted")
    
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body does not contain an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("picture with given id/post with given id not found")


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
        post.delete()
        return HttpResponse("post deleted")
    
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body does not contain an important key")
    except ObjectDoesNotExist:
        return HttpResponseBadRequest("post with given id not found")



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
            public_visible, friend_visible, tag_visible: follow the convention set in the create_post view
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
    post_timing = post.time_posted + timedelta(hours=8) # SG time

    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "tag": {
            "name": post.tag.name,
            "icon": reverse("user_profile:get_tag_icon", args=(post.tag.name,)),
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
        "time_posted": {
            "year": post_timing.year,
            "month": post_timing.month,
            "day": post_timing.day,
            "hour": post_timing.hour,
            "minute": post_timing.minute,
            "second": post_timing.second,
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
        post_object = Post.objects.get(id=post_id)
        if has_access(request.user, post_object):
            post_dict = parse_post_object(post_object)
            return JsonResponse(post_dict)
        else:
            return HttpResponseNotFound()
    
    except ObjectDoesNotExist:
        return HttpResponseNotFound()


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
        start (str): the string of the start date given in the format YYYY-MM-DD-HH-MM-SS
        end (str): the string of the end date given in the format YYYY-MM-DD-HH-MM-SS
        [Optional] tag (str): the string of the tag filter applied to the profile posts
    
    The returned json response contains the following fields:
        posts (list(dict)): the list of posts, each represented by a dictionary
        hasOlderPosts (bool): whether there are posts older than the requested start time, True if there is, false otherwise
        myProfile (bool): whether the request user has the username
    """

    try:
        start_arr = request.GET["start"].split("-")
        end_arr = request.GET["end"].split("-")
        if len(start_arr) != 6 or len(end_arr) != 6:
            return HttpResponseBadRequest("start or end date malformed")
        start_time = datetime(year=int(start_arr[0]), month=int(start_arr[1]), day=int(start_arr[2]), hour=int(start_arr[3]), minute=int(start_arr[4]), second=int(start_arr[5]))
        end_time = datetime(year=int(end_arr[0]), month=int(end_arr[1]), day=int(end_arr[2]), hour=int(end_arr[3]), minute=int(end_arr[4]), second=int(end_arr[5]))
        # only meant to be in SG. If post is made at another point of the world, have to fix this time display
        user_log_obj = UserAuth.objects.get(username=username).user_log

        posts_queryset = user_log_obj.posts.filter(time_posted__range=(start_time, end_time)).order_by('-time_posted')

        if "tag" in request.GET:
            tag = Tag.objects.get(name=request.GET["tag"])
            posts_queryset = posts_queryset.filter(tag=tag)

        posts = list(map(
            lambda post: parse_post_object(post),
            filter(
                lambda post: has_access(request.user, post),
                list(posts_queryset.all())
            )
        ))

        return JsonResponse({
            "posts": posts,
            "hasOlderPosts": user_log_obj.posts.filter(time_posted__lt=start_time).exists(),
            "myProfile": request.user.username == username,
        })
    
    except AttributeError:
        return HttpResponseBadRequest("GET parameter(s) malformed")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("start or end date not found in GET parameter")
    except ObjectDoesNotExist:
        return HttpResponseNotFound("user with the username not found")
    except ValueError:
        return HttpResponseBadRequest("time fields containing characters other than numbers / invalid time")

@login_required
def get_home_feed(request):
    """Return the posts accessible in a user's home feed, excluding their own posts

    Args:
        request (HttpRequest): the request made to this view

    The request must contain the following query fields:
        - sort (str): the sorting method applied by user
        - friend_filter ('1'/'0'): whether user filters home feed to friends only
        - tag_filter('1'/'0'): whether user filters home feed to their tags only
        - limit (str): the maximum number of posts to return
        - start_id (str): the id of the post to start displaying from (excluding)
            When entering home feed for the first time, start_id should be ""
            When trying to load more posts, use the previously returned stop_id as the new start_id

    If sort is "time", the request must contain:
        - start_datetime(str): the datetime("YYYY-MM-DD-HH-MM-SS") of the post to start displaying from (excluding)
            The string should not have 0 as padding (e.g. 2023-7-3-23-12-10 should be used instead of 07 03)
            When entering home feed for the first time, start_timestamp should be ""
            When trying to load more posts, use the previously returned stop_datetime as the new start_datetime

    If sort is "matching_index", the request must contain:
        - start_matching_index (str): the exact matching index of the post to start displaying from
            When entering home feed for the first time, start_matching_index should be "5"
            When trying to load more posts, use the previous stop_matching_index as the new start_matching_index

    Returns:
        JsonResponse containing post data, or HttpResponseBadRequest

    The jsonResponse contains:
        - posts (list(dict)): the list of posts, each represented by a dictionary
        - stop_id (str): the id of the last post in the list of posts

    If sort is "time", the response also contains:
        - stop_datetime (str): the formatted datetime string of the last post in the list of posts

    If sort is "matching_index", the response also contains:
        - stop_matching_index (str): the matching index between user and the creator of the last post
    """
    try:
        posts = Post.objects

        # Exclude user's own posts, and apply filters
        posts = posts.exclude(creator=request.user.user_log)
        if request.GET["friend_filter"] == '1':
            friend_list = list(request.user.user_log.friend_list.all())
            if friend_list is None:
                posts = posts.filter(False)
            else:
                posts = posts.filter(creator__in=friend_list)
        if request.GET["tag_filter"] == '1':
            tag_list = list(request.user.user_profile.tagList.all())
            if tag_list is None:
                posts = posts.filter(False)
            else:
                posts = posts.filter(tag__in=tag_list)

        count = 0
        result = []
        skip = True
        if request.GET["start_id"] == "":
            skip = False

        # Sort, then take accessible posts until limit is reached
        if request.GET["sort"] == "time":
            if request.GET["start_datetime"] != "":
                format = "%Y-%m-%d-%H-%M-%S"
                # start datetime object rounded up by 1 second, so that the post with start_id can be found
                start_datetime = datetime.strptime(request.GET["start_datetime"], format) + timedelta(seconds=1)
                posts = posts.filter(time_posted__lte=start_datetime)
            posts = posts.order_by('-time_posted')
            for post_object in posts:
                if skip and post_object.id == request.GET["start_id"]:
                    skip = False
                    continue
                if not skip and has_access(request.user, post_object):
                    result.append(parse_post_object(post_object))
                    count += 1
                    if count >= int(request.GET["limit"]):
                        break
            ret = {
                "posts": result,
                "stop_datetime": "",
                "stop_id": "",
            }
            if count > 0:
                t = result[count-1]["time_posted"]
                ret["stop_datetime"] = f"{t['year']}-{t['month']}-{t['day']}-{t['hour']}-{t['minute']}-{t['second']}"
                ret["stop_id"] = result[count-1]["id"]
        # TODO: sort by matching index
        else:
            return HttpResponseBadRequest("sort method query string malformed")

        return JsonResponse(ret)

    except AttributeError:
        return HttpResponseBadRequest("GET parameter(s) malformed")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("certain field(s) not found in GET parameter")
