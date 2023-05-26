enum EndPoints {
  home,
  login,
  checkUniqueUsername,
  register,
  logout,

  profileIndex,
  addTags,
  obtainTags,
  setProfileImage,

  viewFriends,
  viewFriendRequests,
  addFriendRequest,
  searchUsers, 
  viewProfile,

}

extension ExtendedEndPoints on EndPoints {
  static const endpoints = {
    EndPoints.home: "/home_async",
    EndPoints.login: "/login_async",
    EndPoints.checkUniqueUsername: "/check_unique_username_async",
    EndPoints.register: "/register_async",
    EndPoints.logout: "/logout_async",
    EndPoints.profileIndex: "/profile/async",
    EndPoints.addTags: "/profile/add_tags",
    EndPoints.obtainTags: "/profile/obtain_tags",
    EndPoints.setProfileImage: "/profile/set_profile_image",
    EndPoints.viewFriends: "/user/friends_async",
    EndPoints.viewFriendRequests: "/user/friend_requests_async",
    EndPoints.addFriendRequest: "/user/add_friend_request",
    EndPoints.searchUsers: "/user/search_users_async", // TODO: broader search and remove '/user'
    EndPoints.viewProfile: "/user/profile_async",

  };

  String get endpoint => endpoints[this]!;
}
