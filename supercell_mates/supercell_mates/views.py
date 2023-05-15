from django.http import HttpResponse, HttpResponseForbidden


def media_access(request, path):
    if request.user.is_authenticated:
        response = HttpResponse()
        del response['Content-Type']
        response['X-Accel-Redirect'] = '/media/' + path
        return response
    else:
        return HttpResponseForbidden('You are not authorised to access this media')