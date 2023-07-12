# Generated by Django 3.2.6 on 2023-07-12 05:33

from django.db import migrations, models
import django.db.models.deletion
import posts.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True)),
                ('title', models.TextField(default='')),
                ('content', models.TextField()),
                ('friend_visible', models.BooleanField()),
                ('tag_visible', models.BooleanField()),
                ('public_visible', models.BooleanField()),
                ('time_posted', models.DateTimeField(auto_now_add=True)),
                ('img_count', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='PostImage',
            fields=[
                ('id', models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True)),
                ('order', models.IntegerField()),
                ('image', models.ImageField(upload_to='post/')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='posts.post')),
            ],
        ),
    ]
