from django.db import models
from datetime import datetime


class UserProfile(models.Model):
    name = models.CharField(max_length=15)
    user_auth = models.OneToOneField("user_auth.UserAuth", on_delete=models.CASCADE, related_name="user_profile", primary_key=True)
    tagList = models.ManyToManyField("user_auth.Tag", related_name="user_profiles")
    profile_pic = models.ImageField(upload_to="profile/img/", blank=True)
    tag_count_limit = models.IntegerField(default=4)
    remove_tag_timestamp = models.FloatField(default=0)


class TagActivityRecord(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="tag_activity_record")
    tag = models.ForeignKey("user_auth.Tag", on_delete=models.CASCADE, related_name="tag_activity_records")
    activity_score = models.FloatField(default=2)
    last_activity_timestamp = models.FloatField(default=datetime.now().timestamp())
