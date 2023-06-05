from django.contrib import admin

from .models import Post

class PostAdmin(admin.ModelAdmin):
    readonly_fields = ('time_posted',)

admin.site.register(Post, PostAdmin)