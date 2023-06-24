def test(arg1, arg2):
    """Some test function
    """
    print(arg1)

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "supercell_mates.settings")
import django
django.setup()
from django.core.files import File

import subprocess
import sys
from random import random

from user_auth.models import UserAuth, Tag
from user_profile.models import UserProfile
from user_log.models import UserLog
from message.models import PrivateChat
from datetime import datetime


def create_superusers():
    nguyen = UserAuth.objects.create_superuser(username='nguyen', password='Nguyen123###')
    nguyen_profile = UserProfile(name='Nguyen Khoi Nguyen', user_auth=nguyen)
    nguyen_profile.save()
    nguyen_log = UserLog(user_auth=nguyen, user_profile=nguyen_profile)
    nguyen_log.save()
    jiale = UserAuth.objects.create_superuser(username='jiale', password='Jiale123###')
    jiale_profile = UserProfile(name='Luo Jiale', user_auth=jiale)
    jiale_profile.save()
    jiale_log = UserLog(user_auth=jiale, user_profile=jiale_profile)
    jiale_log.save()
    jiale_log.friend_list.add(nguyen_log)
    chat = PrivateChat(timestamp=datetime.now())
    chat.save()
    chat.users.add(nguyen)
    chat.users.add(jiale)


def create_users():
    accounts = [
        ["nguyen02", "nkn123", "Nguyen"],
        ["nguyen03", "nkn123", "Nguyen v2"],
        ["nguyen04", "nkn123", "Quack"],
    ]

    for account in accounts:
        user = UserAuth.objects.create_user(username=account[0], password=account[1])
        user_profile_obj = UserProfile(name=account[2], user_auth=user)
        user_profile_obj.save()
        user_log_obj = UserLog(user_auth=user, user_profile=user_profile_obj)
        user_log_obj.save()


def create_tags():
    tags = [
        "Computer Science",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Cyber Security",
        "Software Engineering",
        "Artificial Intelligence",
        "Chinese Chess",
        "Game Development",
        "Choir",
        "International Chess",
        "Cat",
        "Dog",
    ]

    for tag in tags:
        tag_obj = Tag(name=tag)
        tag_obj.save()
        for user in UserProfile.objects.all():
            if len(list(user.tagList.all())) < user.tag_count_limit:
                if random() < 0.2:
                    user.tagList.add(tag_obj)


def setup_tags():
    tags = [
        "Computer Science.png",
        "Mathematics.jpg",
        "Physics.png",
        "Chemistry.png",
        "Biology.png",
        "Cyber Security.png",
        "Software Engineering.png",
        "Artificial Intelligence.png",
        "Chinese Chess.jpg",
        "Game Development.png",
        "Choir.png",
        "International Chess.png",
        "Cat.png",
        "Dog.png",
    ]
    for tag in tags:
        image = open(os.getcwd() + '/tag-icons/' + tag, 'rb')
        tag_obj = Tag(name=tag.split('.')[0])
        tag_obj.save()
        tag_obj.image.save(tag, File(image))
        image.close()


if __name__ == '__main__':
    print("creating superusers ...")
    create_superusers()
    print("creating tags ...")
    setup_tags()
    print("finished")
