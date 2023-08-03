import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:get_it/get_it.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/features/friends/user_listview.dart';
import 'package:supercellmates/functions/notifications.dart';
import 'dart:convert';

import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

@RoutePage()
class FriendsPage extends StatefulWidget {
  const FriendsPage({Key? key}) : super(key: key);

  @override
  State<FriendsPage> createState() => FriendsPageState();
}

class FriendsPageState extends State<FriendsPage> {
  int navigationBarIndex = 0;
  bool dataLoaded = false;

  dynamic friendList;
  dynamic friendRequestList;
  dynamic friendPageBody;

  Notifications notifications = GetIt.I<Notifications>();

  @override
  void initState() {
    dataLoaded = false;
    super.initState();
    getFriendList();
  }

  void updateFriendPageBody(dynamic friendList, bool isFriendRequest) {
    friendPageBody = isFriendRequest
        ? FriendRequestListView(
            friendRequestList: friendList,
            updateCallBack: getFriendRequestList,
          )
        : UserListView(
            userList: friendList,
            updateCallBack: getFriendList,
            isFriendList: true,
          );
    setState(() {
      dataLoaded = true;
    });
  }

  void getFriendList() async {
    dataLoaded = false;
    dynamic friendListJson =
        await getRequest(EndPoints.viewFriends.endpoint, null);
    if (friendListJson == "Connection error") {
      showErrorDialog(context, friendListJson);
      return;
    }
    friendList = jsonDecode(friendListJson);
    updateFriendPageBody(friendList, false);
    notifications.update();
  }

  void getFriendRequestList() async {
    dataLoaded = false;
    dynamic friendRequestListJson =
        await getRequest(EndPoints.viewFriendRequests.endpoint, null);
    if (friendRequestListJson == "Connection error") {
      showErrorDialog(context, friendRequestListJson);
      return;
    }
    friendRequestList = jsonDecode(friendRequestListJson);
    notifications.updateIncomingFriendRequestsCount(friendRequestList.length);
    updateFriendPageBody(friendRequestList, true);
    notifications.update();
  }

  void navigate(int index) {
    if (navigationBarIndex != index) {
      index == 0 ? getFriendList() : getFriendRequestList();
      setState(() {
        navigationBarIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(titleSpacing: 3, title: const Text("My friend page")),
        body: Column(children: [
          NavigationBar(
            height: 55,
            destinations: [
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 40,
                    child: TextButton(
                        onPressed: () {
                          navigate(0);
                        },
                        child: ListenableBuilder(
                          listenable: notifications,
                          builder: (context, child) {
                            return createNotificationBadge(
                                Text(
                                  "Friends",
                                  style: TextStyle(
                                      fontSize: 18,
                                      color: navigationBarIndex == 0
                                          ? Colors.blue
                                          : Colors.blueGrey),
                                ),
                                notifications.outgoingAcceptedRequestCount,
                                14,
                                14);
                          },
                        )),
                  ),
                ],
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 40,
                    child: TextButton(
                      onPressed: () {
                        navigate(1);
                      },
                      child: ListenableBuilder(
                        listenable: notifications,
                        builder: (context, child) {
                          return createNotificationBadge(
                              Text("Requests",
                                  style: TextStyle(
                                      fontSize: 18,
                                      color: navigationBarIndex == 1
                                          ? Colors.blue
                                          : Colors.blueGrey)),
                              notifications.incomingFriendRequestsCount,
                              14,
                              14);
                        },
                      ),
                    ),
                  ),
                ],
              )
            ],
            selectedIndex: navigationBarIndex,
            shadowColor: Colors.grey,
          ),
          SizedBox(
              width: MediaQuery.of(context).size.width,
              height: MediaQuery.of(context).size.height - 140,
              child: dataLoaded
                  ? friendPageBody
                  : Container(
                      alignment: Alignment.center,
                      child: const CircularProgressIndicator(),
                    )),
        ]));
  }
}
