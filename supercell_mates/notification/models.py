from django.db import models


class FriendNotification(models.Model):
    from_user = models.ForeignKey('user_log.UserLog', on_delete=models.CASCADE, related_name='accepted_request_notifications')
    to_user = models.ForeignKey('user_log.UserLog', on_delete=models.CASCADE, related_name='incoming_accepted_friend_requests')