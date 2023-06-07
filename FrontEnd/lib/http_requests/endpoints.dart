enum EndPoints {
  home,
  login,
  checkUniqueUsername,
  register,
  logout,

  profileIndex,
  addTags,
  obtainTags,
  searchTags,
  setProfileImage,

  viewFriends,
  viewFriendRequests,
  addFriendRequest,
  search,
  viewProfile,
  addFriend,
  deleteFriend,
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
    EndPoints.searchTags: "/profile/search_tags",
    EndPoints.setProfileImage: "/profile/set_profile_image",
    EndPoints.viewFriends: "/user/friends_async",
    EndPoints.viewFriendRequests: "/user/friend_requests_async",
    EndPoints.addFriendRequest: "/user/add_friend_request",
    EndPoints.search: "/user/search", // TODO: broader search and remove '/user'
    EndPoints.viewProfile: "/user/profile_async",
    EndPoints.addFriend: "/user/add_friend",
    EndPoints.deleteFriend: "/user/delete_friend",
  };

  String get endpoint => endpoints[this]!;
}
