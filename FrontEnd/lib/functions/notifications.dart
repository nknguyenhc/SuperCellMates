import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:badges/badges.dart' as badges;

class Notifications extends ChangeNotifier {
  int incomingFriendRequestsCount = 0;
  int outgoingAcceptedRequestCount = 0;
  List acceptedRequests = [];
  int unreadChatCount = 0;
  List unreadPrivateChats = [];
  List unreadGroupChats = [];

  void update() {
    countIncomingFriendRequests();
    retrieveAcceptedRequests();
    getUnreadChats();
  }

  // incoming friend requests
  void countIncomingFriendRequests() {
    getRequest(EndPoints.viewFriendRequests.endpoint, null).then((response) {
      if (response == "Connection error") {
        return;
      }
      updateIncomingFriendRequestsCount(jsonDecode(response).length);
    });
  }

  void updateIncomingFriendRequestsCount(int count) {
    incomingFriendRequestsCount = count;
    notifyListeners();
  }

  // outgoing accepted friend requests
  void retrieveAcceptedRequests() {
    postWithCSRF(EndPoints.getAcceptedRequests.endpoint, null).then(
      (response) {
        if (response == "Connection error") return;
        Map results = jsonDecode(response);
        acceptedRequests.addAll(results["users"]);
        updateAcceptedRequestsCount();
      },
    );
  }

  void acknowledgeAcceptedRequest(String username) {
    List toRemove =
        []; // prevent multiple entries for same username, due to delete friend
    for (dynamic user in acceptedRequests) {
      if (user["username"] == username) {
        toRemove.add(user);
      }
    }
    for (dynamic user in toRemove) {
      acceptedRequests.remove(user);
    }
    updateAcceptedRequestsCount();
  }

  void updateAcceptedRequestsCount() {
    outgoingAcceptedRequestCount = acceptedRequests.length;
    notifyListeners();
  }

  // unread chat messages
  void getUnreadChats() {
    getRequest(EndPoints.getUnreadChats.endpoint, null).then((response) {
      if (response == "Connection error") {
        return;
      }
      Map unreadChats = jsonDecode(response);
      unreadPrivateChats = unreadChats["privates"];
      unreadGroupChats = unreadChats["groups"];
      updateUnreadChatsCount();
    });
  }

  void readChat(chatType, id) {
    List chats = chatType == "private" ? unreadPrivateChats : unreadGroupChats;
    int index = chats.indexOf(id);
    if (index == -1) return;
    chats.removeAt(index);
    updateUnreadChatsCount();
  }

  void updateUnreadChatsCount() {
    unreadChatCount = unreadPrivateChats.length + unreadGroupChats.length;
    notifyListeners();
  }
}

Widget createNotificationBadge(Widget child, int? count, double dx, double dy) {
  // count == 0: no badge, display original child
  // count == null: display badge without content
  return count != null && count == 0
      ? child
      : badges.Badge(
          position: badges.BadgePosition.topEnd(top: -dy, end: -dx),
          badgeStyle: const badges.BadgeStyle(
            badgeColor: Colors.red,
          ),
          badgeContent: count == null
              ? Container()
              : Text(
                  count.toString(),
                  style: const TextStyle(color: Colors.white),
                ),
          child: child,
        );
}
