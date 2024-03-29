# Generated by Django 3.2.6 on 2023-07-31 07:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user_auth', '0002_initial'),
        ('user_profile', '0002_userprofile_remove_tag_timestamp'),
    ]

    operations = [
        migrations.CreateModel(
            name='TagActivityRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_score', models.FloatField(default=2)),
                ('last_activity_timestamp', models.FloatField(default=1690789858.863908)),
                ('tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tag_activity_records', to='user_auth.tag')),
                ('user_profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tag_activity_record', to='user_profile.userprofile')),
            ],
        ),
    ]
