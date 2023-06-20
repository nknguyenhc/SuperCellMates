from django.db import models
from django.contrib.auth.models import AbstractUser


class TagRequest(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='tag/', blank=True)
    description = models.TextField(default='')


class Tag(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='tag/', blank=True)


class UserAuth(AbstractUser, models.Model):
    pass


class AdminApplication(models.Model):
    user = models.OneToOneField(UserAuth, on_delete=models.CASCADE, related_name="admin_application")