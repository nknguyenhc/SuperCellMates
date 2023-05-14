from django.db import models

# Create your models here.

class UserProfile(models.Model):
    name = models.CharField(max_length=200)
    user_auth = models.OneToOneField("user_auth.UserAuth", on_delete=models.CASCADE, related_name="user_profile", primary_key=True)
    tagList = models.TextField()