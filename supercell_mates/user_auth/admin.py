from django.contrib import admin
from .models import UserAuth, Tag, TagRequest


admin.site.register(UserAuth)
admin.site.register(Tag)
admin.site.register(TagRequest)