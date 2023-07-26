# Generated by Django 3.2.6 on 2023-07-25 14:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user_log', '0002_remove_userlog_last_login'),
    ]

    operations = [
        migrations.CreateModel(
            name='FriendNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accepted_request_notifications', to='user_log.userlog')),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='incoming_accepted_friend_requests', to='user_log.userlog')),
            ],
        ),
    ]
