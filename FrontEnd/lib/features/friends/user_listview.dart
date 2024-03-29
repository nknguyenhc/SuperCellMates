import 'dart:typed_data';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:supercellmates/functions/notifications.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:supercellmates/features/dialogs.dart';

Widget userDivider = const Divider(
    height: 1,
    thickness: 2,
    color: Colors.black12,
    indent: 10,
    endIndent: 10,
  );

class UserListView extends StatefulWidget {
  const UserListView(
      {Key? key,
      required this.userList,
      required this.updateCallBack,
      required this.isFriendList})
      : super(key: key);

  final dynamic userList;
  final dynamic updateCallBack;
  final bool isFriendList;

  @override
  State<UserListView> createState() => UserListViewState();
}

class UserListViewState extends State<UserListView> {
  int count = 0;
  var dataLoaded = [];
  var profileImages = [];

  Notifications notifications = GetIt.I<Notifications>();

  @override
  void initState() {
    super.initState();
    count = widget.userList.length;
    dataLoaded = List<bool>.filled(count, false, growable: true);
    profileImages =
        List<Uint8List>.filled(count, Uint8List.fromList([]), growable: true);
    for (int i = 0; i < count; i++) {
      loadImage(i);
    }
  }

  void loadImage(index) async {
    profileImages[index] =
        await getRawImageData(widget.userList[index]["profile_pic_url"], false);
    setState(() {
      dataLoaded[index] = true;
    });
  }

  bool checkNewFriend(String username) {
    for (dynamic user in notifications.acceptedRequests) {
      if (user["username"] == username) {
        return true;
      }
    }
    return false;
  }

  Widget buildNewFriendNotificationIcon(String username) {
    return ListenableBuilder(
      listenable: notifications,
      builder: (context, child) {
        return checkNewFriend(username)
            ? newFriendNotificationIcon
            : Container();
      },
    );
  }

  Widget newFriendNotificationIcon = const Icon(
    Icons.circle,
    color: Colors.red,
    size: 12,
  );

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        itemCount: count,
        itemBuilder: (context, index) {
          String name = widget.userList[index]["name"];
          String username = widget.userList[index]["username"];
          bool isNewFriend = checkNewFriend(username);

          return Column(
            children: [
              TextButton(
                onPressed: () async {
                  FocusManager.instance.primaryFocus?.unfocus();
                  if (isNewFriend) {
                    notifications.acknowledgeAcceptedRequest(username);
                  }
                  AutoRouter.of(context).push(OthersProfileRoute(
                      username: username,
                      onDeleteFriendCallBack: () {
                        count -= 1;
                        dataLoaded.removeAt(index);
                        profileImages.removeAt(index);
                        widget.updateCallBack();
                      }));
                },
                child: Row(children: [
                  SizedBox(
                      height: 45,
                      width: 45,
                      child: IconButton(
                        onPressed: () {
                          AutoRouter.of(context).push(SinglePhotoViewer(
                              photoBytes: profileImages[index], actions: []));
                        },
                        icon: dataLoaded[index]
                            ? Image.memory(profileImages[index])
                            : const CircularProgressIndicator(),
                        iconSize: 45,
                        padding: EdgeInsets.zero,
                      )),
                  const Padding(padding: EdgeInsets.all(5)),
                  Column(
                    children: [
                      const Padding(padding: EdgeInsets.only(left: 2)),
                      SizedBox(
                        height: 22,
                        width: MediaQuery.of(context).size.width - 100,
                        child: Text(
                          name,
                          style: const TextStyle(
                              color: Colors.black, fontSize: 16),
                        ),
                      ),
                      SizedBox(
                        height: 22,
                        width: MediaQuery.of(context).size.width - 100,
                        child: Text("@$username",
                            style: const TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 13,
                            )),
                      ),
                      const Padding(padding: EdgeInsets.all(2)),
                    ],
                  ),
                  widget.isFriendList
                      ? buildNewFriendNotificationIcon(username)
                      : Container()
                ]),
              ),
              userDivider
            ],
          );
        });
    return count > 0
        ? list
        : const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "No friends yet.\n\nClick on other users' profile to send friend requests!",
                textAlign: TextAlign.center,
              ),
              Padding(padding: EdgeInsets.only(bottom: 80))
            ],
          );
  }
}

class UserListViewWithCustomOnPressed extends StatefulWidget {
  const UserListViewWithCustomOnPressed(
      {Key? key,
      required this.userList,
      required this.updateCallBack,
      required this.onPressed})
      : super(key: key);

  final dynamic userList;
  final dynamic updateCallBack;
  final dynamic onPressed;

  @override
  State<UserListViewWithCustomOnPressed> createState() =>
      UserListViewWithCustomOnPressedState();
}

class UserListViewWithCustomOnPressedState
    extends State<UserListViewWithCustomOnPressed> {
  int count = 0;
  var dataLoaded = [];
  var profileImages = [];

  @override
  void initState() {
    super.initState();
    count = widget.userList.length;
    dataLoaded = List<bool>.filled(count, false, growable: true);
    profileImages =
        List<Uint8List>.filled(count, Uint8List.fromList([]), growable: true);
    for (int i = 0; i < count; i++) {
      loadImage(i);
    }
  }

  void loadImage(index) async {
    profileImages[index] =
        await getRawImageData(widget.userList[index]["profile_pic_url"], false);
    setState(() {
      dataLoaded[index] = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        itemCount: count,
        itemBuilder: (context, index) {
          String name = widget.userList[index]["name"];
          String username = widget.userList[index]["username"];
          return Column(
            children: [
              TextButton(
                onPressed: () => widget.onPressed(widget.userList[index]),
                child: Row(children: [
                  SizedBox(
                      height: 45,
                      width: 45,
                      child: IconButton(
                        onPressed: () {
                          AutoRouter.of(context).push(SinglePhotoViewer(
                              photoBytes: profileImages[index], actions: []));
                        },
                        icon: dataLoaded[index]
                            ? Image.memory(profileImages[index])
                            : const CircularProgressIndicator(),
                        iconSize: 45,
                        padding: EdgeInsets.zero,
                      )),
                  const Padding(padding: EdgeInsets.all(5)),
                  Column(
                    children: [
                      const Padding(padding: EdgeInsets.only(left: 2)),
                      SizedBox(
                        height: 22,
                        width: MediaQuery.of(context).size.width - 80,
                        child: Text(
                          name,
                          style: const TextStyle(
                              color: Colors.black, fontSize: 16),
                        ),
                      ),
                      SizedBox(
                        height: 22,
                        width: MediaQuery.of(context).size.width - 80,
                        child: Text("@$username",
                            style: const TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 13,
                            )),
                      ),
                      const Padding(padding: EdgeInsets.all(2)),
                    ],
                  )
                ]),
              ),
              userDivider
            ],
          );
        });
    return count > 0
        ? list
        : const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                "No friends yet.\n\nClick on other users' profile to send friend requests!",
                textAlign: TextAlign.center,
              ),
              Padding(padding: EdgeInsets.only(bottom: 80))
            ],
          );
  }
}

class FriendRequestListView extends StatefulWidget {
  const FriendRequestListView(
      {Key? key, required this.friendRequestList, required this.updateCallBack})
      : super(key: key);

  final dynamic friendRequestList;
  final dynamic updateCallBack;

  @override
  State<FriendRequestListView> createState() => FriendRequestListState();
}

class FriendRequestListState extends State<FriendRequestListView> {
  // Remember to update upon deletion!!!
  int count = 0;
  var dataLoaded = [];
  var profileImages = [];

  @override
  void initState() {
    super.initState();
    count = widget.friendRequestList.length;
    dataLoaded = List<bool>.filled(count, false, growable: true);
    profileImages =
        List<Uint8List>.filled(count, Uint8List.fromList([]), growable: true);
    for (int i = 0; i < count; i++) {
      loadImage(i);
    }
  }

  void loadImage(index) async {
    profileImages[index] = await getRawImageData(
        widget.friendRequestList[index]["profile_pic_url"], false);
    setState(() {
      dataLoaded[index] = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        itemCount: widget.friendRequestList.length,
        itemBuilder: (context, index) {
          String name = widget.friendRequestList[index]["name"];
          String username = widget.friendRequestList[index]["username"];
          return Column(
            children: [
              Row(
                children: [
                  const Padding(padding: EdgeInsets.only(left: 12)),
                  SizedBox(
                      height: 45,
                      width: 45,
                      child: IconButton(
                        onPressed: () {
                          AutoRouter.of(context).push(SinglePhotoViewer(
                              photoBytes: profileImages[index], actions: []));
                        },
                        icon: dataLoaded[index]
                            ? Image.memory(profileImages[index])
                            : const CircularProgressIndicator(),
                        iconSize: 45,
                        padding: EdgeInsets.zero,
                      )),
                  TextButton(
                      style: const ButtonStyle(
                          padding: MaterialStatePropertyAll(EdgeInsets.all(8))),
                      onPressed: () async {
                        FocusManager.instance.primaryFocus?.unfocus();
                        AutoRouter.of(context)
                            .push(OthersProfileRoute(username: username));
                      },
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.only(left: 2),
                            height: 22,
                            width: MediaQuery.of(context).size.width - 230,
                            child: Text(
                              name,
                              style: const TextStyle(
                                  color: Colors.black, fontSize: 16),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.only(left: 2),
                            height: 22,
                            width: MediaQuery.of(context).size.width - 230,
                            child: Text("@$username",
                                style: const TextStyle(
                                  color: Colors.blueGrey,
                                  fontSize: 13,
                                )),
                          ),
                          const Padding(padding: EdgeInsets.all(2)),
                        ],
                      )),
                  TextButton(
                      onPressed: () {
                        showConfirmationDialog(context,
                            "Are you sure to accept $name's friend request?",
                            () async {
                          startUploadingDialog(context, "data");
                          dynamic body = {
                            "username": username,
                            "accepted": true,
                          };
                          dynamic message = await postWithCSRF(
                              EndPoints.addFriend.endpoint, body);
                          stopLoadingDialog(context);
                          Future.delayed(Duration(milliseconds: 100))
                              .then((value) {
                            if (message == "ok") {
                              showSuccessDialog(
                                  context, "Successfully added friend!");
                              count -= 1;
                              dataLoaded.removeAt(index);
                              profileImages.removeAt(index);
                              widget.updateCallBack();
                            } else {
                              showErrorDialog(context, message);
                            }
                          });
                        });
                      },
                      style: ButtonStyle(
                        backgroundColor:
                            MaterialStateProperty.all(Colors.lightBlue),
                        padding: MaterialStateProperty.all(EdgeInsets.zero),
                      ),
                      child: const Text("Accept",
                          style: TextStyle(color: Colors.white, fontSize: 14))),
                  const Padding(padding: EdgeInsets.all(5)),
                  TextButton(
                      onPressed: () {
                        showConfirmationDialog(context,
                            "Are you sure to reject $name's friend request?",
                            () async {
                          startUploadingDialog(context, "data");
                          dynamic body = {
                            "username": username,
                            "accepted": false,
                          };
                          dynamic message = await postWithCSRF(
                              EndPoints.addFriend.endpoint, body);
                          stopLoadingDialog(context);
                          Future.delayed(Duration(milliseconds: 100))
                              .then((value) {
                            if (message == "ok") {
                              showSuccessDialog(context,
                                  "Successfully declined friend request!");
                              count -= 1;
                              dataLoaded.removeAt(index);
                              profileImages.removeAt(index);
                              widget.updateCallBack();
                            } else {
                              showErrorDialog(context, message);
                            }
                          });
                        });
                      },
                      style: ButtonStyle(
                        backgroundColor: MaterialStateProperty.all(Colors.pink),
                        padding: MaterialStateProperty.all(EdgeInsets.zero),
                      ),
                      child: const Text("Decline",
                          style: TextStyle(color: Colors.white, fontSize: 14))),
                ],
              ),
              userDivider
            ],
          );
        });
    return count > 0
        ? list
        : const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("No friend requests yet."),
              Padding(padding: EdgeInsets.only(bottom: 80))
            ],
          );
  }
}
