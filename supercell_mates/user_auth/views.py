from django.shortcuts import render, redirect, reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseNotAllowed
from django.utils.datastructures import MultiValueDictKeyError
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.files import File

from .models import UserAuth, Tag, TagRequest
from user_profile.models import UserProfile


@login_required
def home(request):
    return render(request, "user_auth/home.html")


@ensure_csrf_cookie
def home_async(request):
    if not request.user.is_authenticated:
        print(request.META['HTTP_HOST'])
        return HttpResponse("not authorised", status=401)
    else:
        return HttpResponse("logged in")


def login_async(request):
    if not request.user.is_authenticated:
        if request.method == "POST":
            try:
                username = request.POST["username"]
                password = request.POST["password"]
                user = authenticate(request, username=username, password=password)

                if user is not None:
                    login(request, user)
                    return HttpResponse("logged in")
                else:
                    return HttpResponse("wrong username or password")
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing username or password")
        else:
            return HttpResponseNotAllowed(['POST'])
    else:
        return HttpResponseBadRequest("you are logged in already")


def login_user(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            try:
                username = request.POST["username"]
                password = request.POST["password"]
                user = authenticate(request, username=username, password=password)

                if user is not None:
                    login(request, user)
                    return redirect(reverse("user_auth:home"))
                else:
                    return render(request, 'user_auth/login.html', {
                        "error_message": "Wrong username or password"
                    })
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing username or password")
        else:
            return HttpResponseBadRequest("you are already logged in")

    elif request.method == 'GET':
        return render(request, "user_auth/login.html")

    else:
        return HttpResponseNotAllowed(['GET', 'POST'])


def check_unique_username_async(request):
    if request.method == "POST":
        try:
            username = request.POST["username"]
            if UserAuth.objects.filter(username = username).exists():
                return HttpResponse("username is already taken")
            return HttpResponse("username is unique")
        except AttributeError:
            return HttpResponseBadRequest("request does not contain form data")
        except MultiValueDictKeyError:
            return HttpResponseBadRequest("request body is missing username")
    else:
        return HttpResponseNotAllowed(['POST'])


def register_async(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            try:
                username = request.POST["username"]
                password = request.POST["password"]
                name = request.POST["name"]
                if username == '' or password == '': # this only serve as a backup, checking empty fields should be done in front end
                    return HttpResponseBadRequest("username or password is empty")

                try:
                    user = UserAuth.objects.create_user(username=username, password=password)
                    user_profile_obj = UserProfile(name=name, user_auth=user)
                    with open('./user_auth/default_profile_image.png', 'rb') as default_image:
                        user_profile_obj.profile_pic.save("default.png", File(default_image), save=False)
                    user_profile_obj.save()
                    login(request, user)
                except IntegrityError:
                    return HttpResponse("username already taken")

                return HttpResponse("account created")
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing name, username or password")
        else:
            return HttpResponseBadRequest("you are already logged in")
    else:
        return HttpResponseNotAllowed(["POST"])


def register(request):
    if not request.user.is_authenticated:
        if request.method == "POST":
            try:
                username = request.POST["username"]
                password = request.POST["password"]
                name = request.POST["name"]
                if username == '' or password == '' or name == '':
                    return render(request, "user_auth/register.html", {
                        "error_message": "username/password or name is empty"
                    })

                try:
                    user = UserAuth.objects.create_user(username=username, password=password)
                    user_profile_obj = UserProfile(name=name, user_auth=user)
                    with open('./user_auth/default_profile_image.png', 'rb') as default_image:
                        user_profile_obj.profile_pic.save("default.png", File(default_image), save=False)
                    user_profile_obj.save()
                    login(request, user)
                except IntegrityError:
                    return render(request, "user_auth/register.html", {
                        "error_message": "username already taken"
                    })

                return redirect(reverse("user_profile:setup"))
            except AttributeError:
                return HttpResponseBadRequest("request does not contain form data")
            except MultiValueDictKeyError:
                return HttpResponseBadRequest("request body is missing name, username or password")

        elif request.method == 'GET':
            return render(request, "user_auth/register.html")

        else:
            return HttpResponseNotAllowed(["GET", "POST"])

    else:
        return redirect(reverse("user_auth:home"))


@login_required
def logout_user(request):
    logout(request)
    return redirect(reverse("user_auth:home"))


def logout_async(request):
    if request.user.is_authenticated:
        logout(request)
        return HttpResponse("logged out")
    else:
        return HttpResponseBadRequest("you are already logged out")


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
def add_tag_request(request):
    if request.method == "POST":
        try:
            tagName = request.POST["tag"]
            tag_request = TagRequest(name=tagName)
            tag_request.save()
            return HttpResponse("successfully added tag")
        except AttributeError:
            return HttpResponseBadRequest("request does not contain form data")
        except MultiValueDictKeyError:
            return HttpResponseBadRequest("request is missing an important key")
    else:
        return HttpResponseNotAllowed(["POST"])
