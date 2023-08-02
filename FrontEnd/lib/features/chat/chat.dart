import 'dart:convert';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:supercellmates/features/chat/chat_listview.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/functions/notifications.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

class ChatPage extends StatefulWidget {
  ChatPage({Key? key, required this.username}) : super(key: key);

  final String username;

  @override
  State<ChatPage> createState() => ChatPageState();
}

class ChatPageState extends State<ChatPage> {
  bool dataLoaded = false;
  int navigationBarIndex = 0;
  dynamic chatList;
  Notifications notifications = GetIt.I<Notifications>();

  @override
  void initState() {
    super.initState();
    loadChats(0);
  }

  void navigate(int index) {
    if (navigationBarIndex != index) {
      loadChats(index);
      setState(() {
        navigationBarIndex = index;
      });
    }
  }

  void loadChats(int index) async {
    dataLoaded = false;
    dynamic responseJson;
    responseJson = await getRequest(
        index == 0
            ? EndPoints.getPrivateChats.endpoint
            : EndPoints.getGroupChats.endpoint,
        null);
    if (responseJson == "Connection error") {
      showErrorDialog(context, responseJson);
      return;
    }
    dynamic response = jsonDecode(responseJson);
    notifications.getUnreadChats();
    setState(() {
      chatList = index == 0 ? response["privates"] : response["groups"];
      dataLoaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    TextButton createGroupButton = TextButton(
        onPressed: () {
          context.router
              .push(CreateGroupRoute(updateCallBack: () => loadChats(1)));
        },
        style: const ButtonStyle(
            padding: MaterialStatePropertyAll(EdgeInsets.only(top: 5))),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(
              Icons.add,
              size: 25,
            ),
            Padding(padding: EdgeInsets.only(right: 10)),
            Text(
              "New group",
            )
          ],
        ));

    return Column(children: [
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
                  child: Text(
                    "Private",
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
                  child: Text("Groups",
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
      navigationBarIndex == 1
          ? SizedBox(
              height: 35,
              child: createGroupButton,
            )
          : Container(),
      SizedBox(
          width: MediaQuery.of(context).size.width,
          height: navigationBarIndex == 0
              ? MediaQuery.of(context).size.height - 220
              : MediaQuery.of(context).size.height - 255,
          child: dataLoaded
              ? ChatListView(
                  username: widget.username,
                  chatList: chatList,
                  isPrivate: navigationBarIndex == 0,
                )
              : Container(
                  alignment: Alignment.center,
                  child: const CircularProgressIndicator(),
                ))
    ]);
  }
}
