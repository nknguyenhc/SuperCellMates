import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:badges/badges.dart' as badges;

class Notifications extends ChangeNotifier {
  int incomingFriendRequestsCount = 0;

  void countIncomingFriendRequests() {
    getRequest(EndPoints.viewFriendRequests.endpoint, null).then((response) {
      if (response == "Connection error") {
        return 0;
      }
      updateIncomingFriendRequestsCount(jsonDecode(response).length);
    });
  }

  void updateIncomingFriendRequestsCount(int count) {
    incomingFriendRequestsCount = count;
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
