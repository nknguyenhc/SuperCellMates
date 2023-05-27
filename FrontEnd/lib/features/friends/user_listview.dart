import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_login/flutter_login.dart';
import 'dart:convert';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:supercellmates/features/dialogs.dart';

class UserListView extends StatelessWidget {
  const UserListView({Key? key, required this.userList}) : super(key: key);

  final dynamic userList;

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        itemCount: userList.length,
        itemBuilder: (context, index) {
          String name = userList[index]["name"];
          String username = userList[index]["username"];
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
                  child: Column(
                    children: [
                      const Padding(padding: EdgeInsets.all(2)),
                      SizedBox(
                        width: MediaQuery.of(context).size.width,
                        child: Text(
                          name,
                          style: const TextStyle(
                              color: Colors.black, fontSize: 16),
                        ),
                      ),
                      SizedBox(
                        width: MediaQuery.of(context).size.width,
                        child: Text(username,
                            style: const TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 14,
                            )),
                      ),
                      const Padding(padding: EdgeInsets.all(2)),
                    ],
                  )),
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

class FriendRequestListView extends StatelessWidget {
  const FriendRequestListView(
      {Key? key, required this.FriendRequestList, required this.updateCallBack})
      : super(key: key);

  final dynamic FriendRequestList;
  final dynamic updateCallBack;

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        itemCount: FriendRequestList.length,
        itemBuilder: (context, index) {
          String name = FriendRequestList[index]["name"];
          String username = FriendRequestList[index]["username"];
          return Column(
            children: [
              Row(
                children: [
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
                            width: MediaQuery.of(context).size.width - 170,
                            child: Text(
                              name,
                              style: const TextStyle(
                                  color: Colors.black, fontSize: 16),
                            ),
                          ),
                          SizedBox(
                            width: MediaQuery.of(context).size.width - 170,
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
                            updateCallBack();
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
                            updateCallBack();
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
