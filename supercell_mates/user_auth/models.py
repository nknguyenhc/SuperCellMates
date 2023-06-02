from django.db import models
from django.contrib.auth.models import AbstractUser


class TagRequest(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='tag/', blank=True)


class Tag(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='tag/', blank=True)


class UserAuth(AbstractUser, models.Model):
    pass
