from django.http import HttpResponseForbidden
from django.http.response import FileResponse


def media_access(request, path):
    print("checking media access")
    if request.user.is_authenticated:
        return FileResponse(request.user.user_profile.profile_pic)
    else:
        return HttpResponseForbidden('You are not authorised to access this media')