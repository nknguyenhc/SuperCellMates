import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:badges/badges.dart' as badges;

class Notifications extends ChangeNotifier {
  int incomingFriendRequestsCount = 0;
  int unreadChatCount = 0;
  List unreadPrivateChats = [];
  List unreadGroupChats = [];

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
