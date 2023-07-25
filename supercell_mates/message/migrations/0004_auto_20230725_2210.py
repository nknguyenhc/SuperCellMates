# Generated by Django 3.2.6 on 2023-07-25 14:10

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('message', '0003_replypostmessage'),
    ]

    operations = [
        migrations.AddField(
            model_name='groupfilemessage',
            name='seen_users',
            field=models.ManyToManyField(related_name='seen_group_file_messages', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='grouptextmessage',
            name='seen_users',
            field=models.ManyToManyField(related_name='seen_group_text_messages', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='privatefilemessage',
            name='seen_users',
            field=models.ManyToManyField(related_name='seen_private_file_messages', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='privatetextmessage',
            name='seen_users',
            field=models.ManyToManyField(related_name='seen_private_text_messages', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='replypostmessage',
            name='seen_users',
            field=models.ManyToManyField(related_name='seen_reply_post_messages', to=settings.AUTH_USER_MODEL),
        ),
    ]
