# Generated by Django 4.2.1 on 2023-06-21 07:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_log', '0006_alter_userlog_friend_list'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userlog',
            name='friend_list',
            field=models.ManyToManyField(blank=True, to='user_log.userlog'),
        ),
    ]
