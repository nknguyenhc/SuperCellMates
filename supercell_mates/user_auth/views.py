from django.shortcuts import render, redirect, reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseNotAllowed, HttpResponseForbidden, FileResponse
from django.utils.datastructures import MultiValueDictKeyError
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.http import url_has_allowed_host_and_scheme as is_safe_url
from django.views.decorators.http import require_http_methods
import io
from django.core.files.images import ImageFile
import magic
from PIL import Image

from user_profile.views import verify_image

from .models import UserAuth, Tag, TagRequest, AdminApplication
from user_profile.models import UserProfile
from user_log.models import UserLog


def documentation(request):
    return render(request, 'documentation/documentation.html')


def testing(request):
    return render(request, 'documentation/testing.html')


def about(request):
    return render(request, "documentation/about.html")


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

                # for ease of testing, we create user profile if it is superuser
                if user.is_superuser and not hasattr(user, "user_profile"):
                    user_profile_obj = UserProfile(name=user.username, user_auth=user)
                    user_profile_obj.save()
                    user_log_obj = UserLog(user_auth=user, user_profile=user_profile_obj)
                    user_log_obj.save()
                
                return HttpResponse("logged in")
            else:
                return HttpResponse("wrong username or password")
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
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing username or password")
    
        elif request.method == 'GET':
            return render(request, "user_auth/login.html")
    
    else:
        return redirect(reverse("user_auth:home"))


def check_unique_username_async(request):
    try:
        username = request.GET["username"]
        if UserAuth.objects.filter(username = username).exists():
            return HttpResponse("username is already taken")
        return HttpResponse("username is unique")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body is missing username")


def register_user(request):
    username = request.POST["username"]
    password = request.POST["password"]
    name = request.POST["name"]
    if username == '' or password == '' or name == '':
        return "username/password or name is empty"
    
    if len(username) > 15:
        return "username too long"
    if len(name) > 15:
        return "name too long"
    if not username.isalnum():
        return "malicious username"

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
            return (HttpResponse if register_feedback == "account created" else HttpResponseBadRequest)(register_feedback)
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
                    return HttpResponseBadRequest(register_feedback)
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


@login_required
def settings(request):
    """Render template for settings.

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the template for adjusting settings
    """
    return render(request, "user_auth/settings.html")


@login_required
@require_http_methods(["POST"])
def change_username(request):
    """Attempt to change the username of the user.
    The new username must be provided in the body of the request, with key "new_username"
    Besides, password must also be provided to confirm the change of username, with key "password"

    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process, if there is a frontend error, return status code 4xx
    """

    try:
        new_username = request.POST["new_username"]
        password = request.POST["password"]

        if len(new_username) > 15:
            return HttpResponseBadRequest("name too long")
        if not new_username.isalnum():
            return HttpResponseBadRequest("malicious username")

        if new_username == '' or password == '':
            return HttpResponseBadRequest("empty username/password")
        if UserAuth.objects.filter(username=new_username).exists():
            return HttpResponse("Username already taken")

        user = authenticate(request, username=request.user.username, password=password)
        if user == request.user:
            user.username = new_username
            user.save()
            login(request, user)
            return HttpResponse("Username changed")
        else:
            return HttpResponse("Password is incorrect")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body does not contain an important key")


@login_required
@require_http_methods(["POST"])
def change_password(request):
    """Attempt to change the password of the user.
    The body of the request must contain the following fields:
        old_password: the old password of the user, to verify that the user is actually making the request
        new_password: the new password to change to
    
    Args:
        request (HttpRequest): the request made to this view
    
    Returns:
        HttpResponse: the feedback of the process, if there is a frontend error, return status code 4xx
    """
    try:
        old_password = request.POST["old_password"]
        new_password = request.POST["new_password"]
        if old_password == '' or new_password == '':
            return HttpResponseBadRequest("either password is empty")
        user = authenticate(request, username=request.user.username, password=old_password)
        if user == request.user:
            user.set_password(new_password)
            user.save()
            login(request, user)
            return HttpResponse("Password changed")
        else:
            return HttpResponse("Old password is incorrect")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request body does not contain an important key")


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
    if request.user.is_staff:
        if request.method == "POST":
            try:
                tag_request_id = request.POST["tag_request_id"]
                tag_request_obj = TagRequest.objects.get(id=tag_request_id)
                icon = tag_request_obj.image
                tag_name = tag_request_obj.name
                if not icon:
                    tag = Tag(name=tag_name)
                else:
                    tag = Tag(name=tag_name, image=icon)
                tag.save()

                if tag_request_obj.requester:
                    if len(tag_request_obj.requester.tagList.all()) < tag_request_obj.requester.tag_count_limit:
                        tag_request_obj.requester.tagList.add(tag)

                tag_request_obj.delete()
                return HttpResponse("successfully added tag")

            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing an important key")
            except ObjectDoesNotExist:
                return HttpResponseBadRequest("tag request not present/already deleted")
        else:
            return HttpResponseNotAllowed(["POST"])
    else:
        return HttpResponseForbidden()
    

def new_tag_admin(request):
    if request.user.is_staff:
        if request.method == "POST":
            try:
                tag_name = request.POST["tag"]
                if len(tag_name) > 25:
                    return HttpResponseBadRequest("tag name too long")
                if TagRequest.objects.filter(name=tag_name).exists() or Tag.objects.filter(name=tag_name).exists():
                    return HttpResponse("Tag already exists/Tag request already exists")

                has_img = False
                if "img" in request.FILES:
                    has_img = True
                    img = request.FILES["img"]
                    if not verify_image(img):
                        return HttpResponseBadRequest("Tag icon is not image")

                if has_img:
                    tag = Tag(name=tag_name, image=img)
                else:
                    tag = Tag(name=tag_name)
                tag.save()
                return HttpResponse("Tag added")
            
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing an important key")
        else:
            return HttpResponseNotAllowed(["POST"])
    else:
        return HttpResponseForbidden()


def remove_tag_request(request):
    if request.user.is_staff:
        if request.method == "POST":
            try:
                tag_request_id = request.POST["tag_request_id"]
                TagRequest.objects.get(id=tag_request_id).delete()
                return HttpResponse("successfully removed request")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing an important key")
            except ObjectDoesNotExist:
                return HttpResponseBadRequest("tag request with the given id not found")
        else:
            return HttpResponseNotAllowed(["POST"])
    else:
        return HttpResponseForbidden()


def obtain_tag_requests(request):
    if request.user.is_staff:
        tag_request_objs = list(TagRequest.objects.all())
        tag_requests = list(map(lambda request_obj:{
            "id": request_obj.id,
            "name": request_obj.name,
            "icon": reverse("user_auth:get_tag_request_icon", args=(request_obj.id,)),
            "description": request_obj.description
        }, tag_request_objs))
        return JsonResponse({"tag_requests": tag_requests})
    else:
        return HttpResponseForbidden()


@login_required
@require_http_methods(["POST"])
def add_tag_request(request):
    try:
        tag_name = request.POST["tag"]
        description = request.POST["description"]
        if len(tag_name) > 25:
            return HttpResponseBadRequest("tag name too long")
        if len(description) > 200:
            return HttpResponseBadRequest("description too long")
        if duplicate_tag_exists(tag_name):
            return HttpResponse("tag already present/requested")
        
        has_img = False
        if "img" in request.POST:
            has_img = True
            img_bytearray = request.POST["img"].strip("[]").split(", ")
            img_bytearray = bytearray(list(map(lambda x: int(x.strip()), img_bytearray)))
            img = ImageFile(io.BytesIO(img_bytearray), name=request.user.username)
            try:
                pil_img = Image.open(img)
                pil_img.verify()
            except (IOError, SyntaxError):
                return HttpResponseBadRequest("not image")
        elif "img" in request.FILES:
            has_img = True
            img = request.FILES["img"]
            if not verify_image(img):
                return HttpResponseBadRequest("not image")
    
        if request.POST["attach"] == "true":
            if has_img:
                tag_request = TagRequest(name=tag_name, image=img, description=description, requester=request.user.user_profile)
            else:
                tag_request = TagRequest(name=tag_name, description=description, requester=request.user.user_profile)
        else:
            if has_img:
                tag_request = TagRequest(name=tag_name, image=img, description=description)
            else:
                tag_request = TagRequest(name=tag_name, description=description)

        tag_request.save()
        return HttpResponse("Successfully added tag request")
    
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request is missing an important key")


def admin(request):
    if request.user.is_staff:
        return render(request, 'user_auth/admin.html')
    else:
        return HttpResponseForbidden()


def get_tag_request_icon(request, tag_id):
    if request.user.is_staff:
        if not TagRequest.objects.filter(id=tag_id).exists():
            return HttpResponseNotFound()
        else:
            icon = TagRequest.objects.get(id=tag_id).image
            if not icon:
                return redirect('/static/media/default-tag-icon.png')
            else:
                return FileResponse(icon)
    
    else:
        return HttpResponseForbidden()


@login_required
def admin_application(request):
    if request.method == "POST":
        if not hasattr(request.user, 'admin_application') and not request.user.is_staff:
            admin_application = AdminApplication(user=request.user)
            admin_application.save()
            return HttpResponse("ok")
        else:
            return HttpResponse("You have already applied for admin")
    else:
        return render(request, "user_auth/admin_application.html")


def manage_admin(request):
    if request.user.is_superuser:
        return render(request, 'user_auth/manage_admin.html')
    else:
        return HttpResponseNotFound()


def get_admin_requests(request):
    if request.user.is_superuser:
        return JsonResponse({
            "requests": list(map(
                lambda application: application.user.username,
                list(AdminApplication.objects.all())
            ))
        })
    else:
        return HttpResponseNotFound()


def get_admins(request):
    if request.user.is_superuser:
        return JsonResponse({
            "admins": list(map(
                lambda user: user.username,
                list(UserAuth.objects.filter(is_staff=True, is_superuser=False).all())
            ))
        })
    else:
        return HttpResponseNotFound()


def add_admin(request):
    if request.user.is_superuser:
        username = request.POST["username"]
        user = UserAuth.objects.get(username=username)
        user.is_staff = True
        user.admin_application.delete()
        user.save()
        return HttpResponse("privilege upgraded")
    else:
        return HttpResponseNotFound()


def remove_admin(request):
    if request.user.is_superuser:
        username = request.POST["username"]
        user = UserAuth.objects.get(username=username)
        if not user.is_superuser:
            user.is_staff = False
            user.save()
            return HttpResponse("privilege downgraded")
        else:
            return HttpResponse("stop messing around ...")
    else:
        return HttpResponseNotFound()