import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "supercell_mates.settings")
import django
django.setup()

import subprocess
import sys
from random import random

from user_auth.models import UserAuth, Tag
from user_profile.models import UserProfile
from user_log.models import UserLog


def flush():
    subprocess.run('python manage.py flush --no-input')


def create_superusers():
    UserAuth.objects.create_superuser(username="nguyen", password="Nguyen123###")


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


if __name__ == '__main__':
    print("flushing database ...")
    flush()
    print("creating superusers ...")
    create_superusers()
    print("creating users ...")
    create_users()
    print("creating tags ...")
    create_tags()
    print("finished")