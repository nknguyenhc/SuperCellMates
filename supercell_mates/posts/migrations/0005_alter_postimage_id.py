# Generated by Django 3.2.6 on 2023-06-06 12:51

from django.db import migrations, models
import posts.models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0004_auto_20230604_2340'),
    ]

    operations = [
        migrations.AlterField(
            model_name='postimage',
            name='id',
            field=models.CharField(default=posts.models.random_str, max_length=50, primary_key=True, serialize=False, unique=True),
        ),
    ]