from django.shortcuts import render, redirect, reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseNotAllowed, FileResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.http import url_has_allowed_host_and_scheme as is_safe_url
from django.views.decorators.http import require_http_methods
import io
from django.core.files.images import ImageFile
import magic

from user_profile.views import verify_image

from .models import UserAuth, Tag, TagRequest
from user_profile.models import UserProfile
from user_log.models import UserLog


def about(request):
    return render(request, "user_auth/about.html")


@login_required
def home(request):
    return render(request, "user_auth/home.html")


@ensure_csrf_cookie
def home_async(request):
    return HttpResponse()


@require_http_methods(["POST"])
def login_async(request):
    if not request.user.is_authenticated:
        try:
            username = request.POST["username"]
            password = request.POST["password"]
            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)

                if user.is_superuser and user.user_profile is not None:
                    user_profile_obj = UserProfile(name=user.username, user_auth=user)
                    user_profile_obj.save()
                    user_log_obj = UserLog(user_auth=user, user_profile=user_profile_obj)
                    user_log_obj.save()
                
                return HttpResponse("logged in")
            else:
                return HttpResponse("wrong username or password")
        except AttributeError:
            return HttpResponseBadRequest("request does not contain form data")
        except MultiValueDictKeyError:
            return HttpResponseBadRequest("request body is missing username or password")
    else:
        return HttpResponseBadRequest("you are logged in already")


@require_http_methods(["GET", "POST"])
def login_user(request):
    if not request.user.is_authenticated:
        if request.method == "POST":
            try:
                username = request.POST["username"]
                password = request.POST["password"]
                user = authenticate(request, username=username, password=password)

                if user is not None:
                    login(request, user)

                    # for ease of testing, we create user profile if it is superuser
                    if user.is_superuser and not hasattr(user, "user_profile"):
                        user_profile_obj = UserProfile(name=user.username, user_auth=user)
                        user_profile_obj.save()
                        user_log_obj = UserLog(user_auth=user, user_profile=user_profile_obj)
                        user_log_obj.save()

                    next_url = request.GET.get("next", "/")
                    if is_safe_url(next_url, {request.get_host()}):
                        return redirect(next_url)
                    return redirect(reverse("user_auth:home"))
                else:
                    return render(request, 'user_auth/login.html', {
                        "error_message": "Wrong username or password"
                    })
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing username or password")
    
        elif request.method == 'GET':
            return render(request, "user_auth/login.html")
    
    else:
        return redirect(reverse("user_auth:home"))


@require_http_methods(["POST"])
def check_unique_username_async(request):
    try:
        username = request.POST["username"]
        if UserAuth.objects.filter(username = username).exists():
            return HttpResponse("username is already taken")
        return HttpResponse("username is unique")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing username")


def register_user(request):
    username = request.POST["username"]
    password = request.POST["password"]
    name = request.POST["name"]
    if username == '' or password == '' or name == '':
        return "username/password or name is empty"

    try:
        user = UserAuth.objects.create_user(username=username, password=password)
        user_profile_obj = UserProfile(name=name, user_auth=user)
        user_profile_obj.save()
        user_log_obj = UserLog(user_auth=user, user_profile=user_profile_obj)
        user_log_obj.save()
        login(request, user)
    except IntegrityError:
        return "username already taken"
    return "account created"


@require_http_methods(["POST"])
def register_async(request):
    if not request.user.is_authenticated:
        try:
            register_feedback = register_user(request)
            return HttpResponse(register_feedback)
        except AttributeError:
            return HttpResponseBadRequest("request does not contain form data")
        except MultiValueDictKeyError:
            return HttpResponseBadRequest("request body is missing name, username or password")
    
    else:
        return HttpResponseBadRequest("you are already logged in")


@require_http_methods(["GET", "POST"])
def register(request):
    if not request.user.is_authenticated:
        if request.method == "POST":
            try:
                register_feedback = register_user(request)
                if register_feedback == "account created":
                    return redirect(reverse("user_profile:setup"))
                else:
                    return render(request, "user_auth/register.html", {
                        "error_message": "username already taken"
                    })
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing name, username or password")

        elif request.method == 'GET':
            return render(request, "user_auth/register.html")
    
    else:
        return redirect(reverse("user_auth:home"))


@login_required
def logout_user(request):
    logout(request)
    return redirect(reverse("user_auth:home"))


@login_required
def logout_async(request):
    logout(request)
    return HttpResponse("logged out")


def duplicate_tag_exists(tag_name):
    """Determine if any current tag/tag request is the same as the tag name

    Args:
        tag_name (str): the tag name to check against db
    
    Returns:
        bool: whether there already exists a similar tag/tag request, True if it is so, False otherwise
    """

    tag_name = tag_name.lower()
    def same_tag(db_tag_name):
        if len(db_tag_name) != len(tag_name):
            return False
        return db_tag_name.lower() == tag_name
    
    return any(list(map(
        lambda tag: same_tag(tag.name),
        list(Tag.objects.all())
    ))) or any(list(map(
        lambda tag: same_tag(tag.name),
        list(TagRequest.objects.all())
    )))


def add_tag_admin(request):
    if request.user.is_superuser:
        if request.method == "POST":
            try:
                tag_request_id = request.POST["tag_request_id"]
                tag_request_obj = TagRequest.objects.get(id=tag_request_id)
                icon = tag_request_obj.image
                tag_request_obj.delete()
                tag_name = request.POST["tag"]
                if not icon:
                    tag = Tag(name=tag_name)
                else:
                    tag = Tag(name=tag_name, image=icon)
                tag.save()
                return HttpResponse("successfully added tag")
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing an important key")
            except ObjectDoesNotExist:
                return HttpResponseBadRequest("tag request not present/already deleted")
        else:
            return HttpResponseNotAllowed(["POST"])
    else:
        return HttpResponseNotFound()
    

def new_tag_admin(request):
    if request.user.is_superuser:
        if request.method == "POST":
            try:
                tagName = request.POST["tag"]
                tag = Tag(name=tagName)
                tag.save()
                return HttpResponse("tag added")
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing an important key")
        else:
            return HttpResponseNotAllowed(["POST"])
    else:
        return HttpResponseNotFound()


def remove_tag_request(request):
    if request.user.is_superuser:
        if request.method == "POST":
            try:
                tag_request_id = request.POST["tag_request_id"]
                TagRequest.objects.get(id=tag_request_id).delete()
                return HttpResponse("successfully removed request")
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing an important key")
        else:
            return HttpResponseNotAllowed(["POST"])
    else:
        return HttpResponseNotFound()


def obtain_tag_requests(request):
    if request.user.is_superuser:
        tag_request_objs = list(TagRequest.objects.all())
        tag_requests = list(map(lambda request_obj:{
            "id": request_obj.id,
            "name": request_obj.name,
            "icon": reverse("user_auth:get_tag_request_icon", args=(request_obj.name,)),
            "description": request_obj.description
        }, tag_request_objs))
        return JsonResponse({"tag_requests": tag_requests})
    else:
        return HttpResponseNotFound()


@login_required
@require_http_methods(["POST"])
def add_tag_request(request):
    try:
        tag_name = request.POST["tag"]
        description = request.POST["description"]
        if duplicate_tag_exists(tag_name):
            return HttpResponse("tag already present/requested")
        if "img" in request.POST:
            img_bytearray = request.POST["img"].strip("[]").split(", ")
            img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
            img = ImageFile(io.BytesIO(img_bytearray), name=request.user.username)
            if not verify_image(img):
                return HttpResponseBadRequest("not image")
            tag_request = TagRequest(name=tag_name, image=img, description=description)
        elif "img" in request.FILES:
            img = request.FILES["img"]
            if not verify_image(img):
                return HttpResponseBadRequest("not image")
            tag_request = TagRequest(name=tag_name, image=img, description=description)
        else:
            tag_request = TagRequest(name=tag_name, description=description)
        # TODO: check if the file submitted is of correct format
        tag_request.save()
        return HttpResponse("Successfully added tag request")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request is missing an important key")


def admin(request):
    if request.user.is_superuser:
        return render(request, 'user_auth/admin.html')
    else:
        return HttpResponseNotFound()


def get_tag_request_icon(request, tag_name):
    if request.user.is_superuser:
        if not TagRequest.objects.filter(name=tag_name).exists():
            return HttpResponseNotFound()
        else:
            icon = TagRequest.objects.get(name=tag_name).image
            if not icon:
                return redirect('/static/media/default-tag-icon.png')
            else:
                return FileResponse(icon)
    
    else:
        return HttpResponseNotFound()