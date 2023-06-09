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
            name='GroupChat',
            fields=[
                ('id', models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True)),
                ('timestamp', models.FloatField()),
                ('name', models.CharField(max_length=15)),
                ('rep_img', models.ImageField(null=True, upload_to='')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='GroupFileMessage',
            fields=[
                ('id', models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True)),
                ('timestamp', models.FloatField()),
                ('file_field', models.FileField(upload_to='message/')),
                ('file_name', models.CharField(max_length=100)),
                ('is_image', models.BooleanField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='GroupTextMessage',
            fields=[
                ('id', models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True)),
                ('timestamp', models.FloatField()),
                ('text', models.TextField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PrivateChat',
            fields=[
                ('id', models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True)),
                ('timestamp', models.FloatField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PrivateFileMessage',
            fields=[
                ('id', models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True)),
                ('timestamp', models.FloatField()),
                ('file_field', models.FileField(upload_to='message/')),
                ('file_name', models.CharField(max_length=100)),
                ('is_image', models.BooleanField()),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PrivateTextMessage',
            fields=[
                ('id', models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True)),
                ('timestamp', models.FloatField()),
                ('text', models.TextField()),
                ('chat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='text_messages', to='message.privatechat')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
