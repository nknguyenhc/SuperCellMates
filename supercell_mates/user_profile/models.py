from django.db import models


class UserProfile(models.Model):
    name = models.CharField(max_length=200)
    user_auth = models.OneToOneField("user_auth.UserAuth", on_delete=models.CASCADE, related_name="user_profile", primary_key=True)
    tagList = models.ManyToManyField("user_auth.Tag", related_name="user_profiles")
    profile_pic = models.ImageField(upload_to="profile/img/", blank=True)
    tag_count_limit = models.IntegerField(default=4)