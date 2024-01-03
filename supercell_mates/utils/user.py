from user_auth.models import UserAuth


def has_same_tag(request_profile, target_profile):
    target_tag_list = target_profile.tagList.all()
    for tag in request_profile.tagList.all():
        if tag in target_tag_list:
            return True
    return False


def can_view_profile(request_user_auth, target_username):
    if not UserAuth.objects.filter(username=target_username).exists():
        return False

    target_log = UserAuth.objects.get(username=target_username).user_log
    if target_log.public_visible:
        return True
    if target_log.friend_visible:
        if target_log.friend_list.filter(user_auth=request_user_auth).exists():
            if target_log.tag_visible:
                return has_same_tag(request_user_auth.user_profile, target_log.user_profile)
            else:
                return True
        else:
            return False
    else:
        return has_same_tag(request_user_auth.user_profile, target_log.user_profile)
