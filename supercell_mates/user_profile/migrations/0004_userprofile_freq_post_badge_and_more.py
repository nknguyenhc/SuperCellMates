# Generated by Django 4.0.4 on 2023-11-05 08:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_profile', '0003_tagactivityrecord'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='freq_post_badge',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='total_post_badge',
            field=models.IntegerField(default=0),
        ),
    ]
