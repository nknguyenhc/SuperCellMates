from django.shortcuts import render, redirect, reverse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from .models import UserAuth

# Create your views here.

def home(request):
    if not request.user.is_authenticated:
        return redirect(reverse("user_auth:login"))
    else:
        return render(request, "home.html")


def login_user(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect(reverse("user_auth:home"))
        else:
            return render(request, "user_auth/login.html", {
                "error_message": "Wrong username or password"
            })

    return render(request, "user_auth/login.html")


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        try:
            user = UserAuth.objects.create_user(username=username, password=password)
            login(request, user)
        except IntegrityError:
            return render(request, "user_auth/register.html", {
                "error_message": "Username already taken"
            })
        
        return redirect(reverse("user_auth:home"))

    else:
        return render(request, "user_auth/register.html")


def logout_user(request):
    logout(request)
    return redirect(reverse("user_auth:home"))