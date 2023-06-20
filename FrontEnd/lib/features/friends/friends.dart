import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/features/friends/user_listview.dart';
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
          );
    setState(() {
      dataLoaded = true;
    });
  }

  void getFriendList() async {
    dataLoaded = false;
    friendList =
        jsonDecode(await getRequest(EndPoints.viewFriends.endpoint, null));
    updateFriendPageBody(friendList, false);
  }

  void getFriendRequestList() async {
    dataLoaded = false;
    friendRequestList = jsonDecode(
        await getRequest(EndPoints.viewFriendRequests.endpoint, null));
    updateFriendPageBody(friendRequestList, true);
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
            height: 50,
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
                      child: Text(
                        "Friends",
                        style: TextStyle(
                            fontSize: 18,
                            color: navigationBarIndex == 0
                                ? Colors.blue
                                : Colors.blueGrey),
                      ),
                    ),
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
                      child: Text("Requests",
                          style: TextStyle(
                              fontSize: 18,
                              color: navigationBarIndex == 1
                                  ? Colors.blue
                                  : Colors.blueGrey)),
                    ),
                  ),
                ],
              )
            ],
            selectedIndex: navigationBarIndex,
            shadowColor: Colors.grey,
          ),
          !dataLoaded
              ? const CircularProgressIndicator()
              : SizedBox(
                  width: MediaQuery.of(context).size.width,
                  height: MediaQuery.of(context).size.height - 140,
                  child: friendPageBody),
        ]));
  }
}
