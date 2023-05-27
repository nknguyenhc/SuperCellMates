import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:supercellmates/features/dialogs.dart';

class UserListView extends StatefulWidget {
  const UserListView({Key? key, required this.userList}) : super(key: key);

  final dynamic userList;

  @override
  State<UserListView> createState() => UserListViewState();
}

class UserListViewState extends State<UserListView> {
  int count = 0;
  var dataLoaded = [];
  var profileImages = [];

  @override
  void initState() {
    super.initState();
    count = widget.userList.length;
    dataLoaded = List<bool>.filled(count, false, growable: true);
    profileImages = List<Image?>.filled(count, null, growable: true);
    for (int i = 0; i < count; i++) {
      loadImage(i);
    }
  }

  void loadImage(index) async {
    profileImages[index] =
        await getImage(widget.userList[index]["profile_pic_url"]);
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
                onPressed: () async {
                  FocusManager.instance.primaryFocus?.unfocus();
                  dynamic data = await getRequest(
                      "${EndPoints.viewProfile.endpoint}/$username", null);
                  AutoRouter.of(context)
                      .push(OthersProfileRoute(data: jsonDecode(data)));
                },
                child: Row(children: [
                  SizedBox(
                    height: 50,
                    width: 50,
                    child: dataLoaded[index]
                        ? IconButton(
                            onPressed: () {},
                            icon: profileImages[index],
                            iconSize: 50,
                          )
                        : const CircularProgressIndicator(),
                  ),
                  Column(
                    children: [
                      const Padding(padding: EdgeInsets.all(2)),
                      SizedBox(
                        width: MediaQuery.of(context).size.width - 80,
                        child: Text(
                          name,
                          style: const TextStyle(
                              color: Colors.black, fontSize: 16),
                        ),
                      ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width - 80,
                        child: Text(username,
                            style: const TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 14,
                            )),
                      ),
                      const Padding(padding: EdgeInsets.all(2)),
                    ],
                  )
                ]),
              ),
              const Divider(
                height: 1,
                color: Colors.grey,
                indent: 10,
                endIndent: 10,
              )
            ],
          );
        });
    return list;
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
    profileImages = List<Image?>.filled(count, null, growable: true);
    for (int i = 0; i < count; i++) {
      loadImage(i);
    }
  }

  void loadImage(index) async {
    profileImages[index] =
        await getImage(widget.friendRequestList[index]["profile_pic_url"]);
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
                  SizedBox(
                      height: 50,
                      width: 50,
                      child: IconButton(
                        onPressed: () {},
                        icon: dataLoaded[index]
                            ? profileImages[index]
                            : const CircularProgressIndicator(),
                      )),
                  TextButton(
                      onPressed: () async {
                        FocusManager.instance.primaryFocus?.unfocus();
                        dynamic data = await getRequest(
                            "${EndPoints.viewProfile.endpoint}/$username",
                            null);
                        AutoRouter.of(context)
                            .push(OthersProfileRoute(data: jsonDecode(data)));
                      },
                      child: Column(
                        children: [
                          const Padding(padding: EdgeInsets.all(2)),
                          SizedBox(
                            width: MediaQuery.of(context).size.width - 230,
                            child: Text(
                              name,
                              style: const TextStyle(
                                  color: Colors.black, fontSize: 16),
                            ),
                          ),
                          SizedBox(
                            width: MediaQuery.of(context).size.width - 230,
                            child: Text(username,
                                style: const TextStyle(
                                  color: Colors.blueGrey,
                                  fontSize: 14,
                                )),
                          ),
                          const Padding(padding: EdgeInsets.all(2)),
                        ],
                      )),
                  TextButton(
                      onPressed: () {
                        showConfirmationDialog(context,
                            "Are you sure to accept ${name}'s friend request?",
                            () async {
                          dynamic body = {
                            "username": username,
                            "accepted": true,
                          };
                          dynamic message = await postWithCSRF(
                              EndPoints.addFriend.endpoint, body);
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
                            "Are you sure to reject ${name}'s friend request?",
                            () async {
                          dynamic body = {
                            "username": username,
                            "accepted": false,
                          };
                          dynamic message = await postWithCSRF(
                              EndPoints.addFriend.endpoint, body);
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
                      },
                      style: ButtonStyle(
                        backgroundColor: MaterialStateProperty.all(Colors.pink),
                        padding: MaterialStateProperty.all(EdgeInsets.zero),
                      ),
                      child: const Text("Decline",
                          style: TextStyle(color: Colors.white, fontSize: 14))),
                ],
              ),
              const Divider(
                height: 1,
                color: Colors.grey,
                indent: 10,
                endIndent: 10,
              )
            ],
          );
        });
    return list;
  }
}
