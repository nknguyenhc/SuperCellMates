from django.db import models
import uuid


def random_str():
    return str(uuid.uuid4())


class Post(models.Model):
    id = models.CharField(unique=True, primary_key=True, default=random_str, max_length=50)
    title = models.TextField(default='')
    content = models.TextField()
    tag = models.ForeignKey('user_auth.Tag', on_delete=models.CASCADE, related_name="posts")
    friend_visible = models.BooleanField()
    tag_visible = models.BooleanField()
    public_visible = models.BooleanField()
    creator = models.ForeignKey('user_log.UserLog', on_delete=models.CASCADE, related_name="posts")
    time_posted = models.DateTimeField(auto_now=False, auto_now_add=True)


class PostImage(models.Model):
    id = models.CharField(unique=True, primary_key=True, default=random_str, max_length=50)
    order = models.IntegerField()
    image = models.ImageField(upload_to='post/')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="images")