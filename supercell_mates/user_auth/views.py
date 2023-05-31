from django.shortcuts import render, redirect, reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseNotAllowed
from django.utils.datastructures import MultiValueDictKeyError
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.http import url_has_allowed_host_and_scheme as is_safe_url
from django.views.decorators.http import require_http_methods


from .models import UserAuth, Tag, TagRequest
from user_profile.models import UserProfile
from user_log.models import UserLog


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


def add_tag_admin(request):
    if request.user.is_superuser:
        if request.method == "POST":
            try:
                tag_request_id = request.POST["tag_request_id"]
                TagRequest.objects.get(id=tag_request_id).delete()
                tagName = request.POST["tag"]
                tag = Tag(name=tagName)
                tag.save()
                return HttpResponse("successfully added tag")
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing an important key")
        elif request.method == 'GET':
            return render(request, "user_auth/add_tags_admin.html")
        else:
            return HttpResponseBadRequest(["GET", "POST"])

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
            return HttpResponseNotAllowed(["GET", "POST"])
    else:
        return HttpResponseNotFound()


def obtain_tag_requests(request):
    if request.user.is_superuser:
        tag_request_objs = list(TagRequest.objects.all())
        tag_requests = list(map(lambda request_obj:{
            "id": request_obj.id,
            "name": request_obj.name
        }, tag_request_objs))
        return JsonResponse({"tag_requests": tag_requests})
    else:
        return HttpResponseNotFound()


@login_required
@require_http_methods(["POST"])
def add_tag_request(request):
    try:
        tagName = request.POST["tag"]
        tag_request = TagRequest(name=tagName)
        tag_request.save()
        return HttpResponse("Successfully added tag request")
    except AttributeError:
        return HttpResponseBadRequest("request does not contain form data")
    except MultiValueDictKeyError:
        return HttpResponseBadRequest("request is missing an important key")
