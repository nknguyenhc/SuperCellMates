from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class Tag(models.Model):
    name = models.CharField(max_length=100)


class UserAuth(AbstractUser, models.Model):
    pass
