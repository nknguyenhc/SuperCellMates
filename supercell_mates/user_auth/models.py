from django.db import models
from django.contrib.auth.models import AbstractUser


class TagRequest(models.Model):
    name = models.CharField(max_length=25)
    image = models.ImageField(upload_to='tag/', blank=True)
    description = models.TextField(default='')
    requester = models.ForeignKey('user_profile.UserProfile', on_delete=models.SET_NULL, null=True, related_name='tag_requests')


class Tag(models.Model):
    name = models.CharField(max_length=25)
    image = models.ImageField(upload_to='tag/', blank=True)


class UserAuth(AbstractUser, models.Model):
    pass


class AdminApplication(models.Model):
    user = models.OneToOneField(UserAuth, on_delete=models.CASCADE, related_name="admin_application")