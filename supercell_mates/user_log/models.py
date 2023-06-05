from django.db import models


class UserLog(models.Model):
    user_auth = models.OneToOneField('user_auth.UserAuth', on_delete=models.CASCADE, related_name="user_log")
    user_profile = models.OneToOneField('user_profile.UserProfile', on_delete=models.CASCADE, related_name="user_log")
    friend_list = models.ManyToManyField("self", blank=True)
    last_login = models.TimeField(auto_now_add=True)


class FriendRequest(models.Model):
    from_user = models.ForeignKey(UserLog, on_delete=models.CASCADE)
    to_user = models.ForeignKey(UserLog, on_delete=models.CASCADE, related_name="friend_requests")