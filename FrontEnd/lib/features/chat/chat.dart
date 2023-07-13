import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:supercellmates/features/chat/chat_listview.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

class ChatPage extends StatefulWidget {
  ChatPage({Key? key, required this.username}) : super(key: key);

  final String username;

  @override
  State<ChatPage> createState() => ChatPageState();
}

class ChatPageState extends State<ChatPage> {
  bool dataLoaded = false;
  int navigationBarIndex = 0;
  dynamic chatList = null;

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
    if (index == 1) {
      setState(() {
        chatList = {};
        dataLoaded = true;
        return;
      });
    } else {
      responseJson = await getRequest(EndPoints.getPrivateChats.endpoint, null);
      if (responseJson == "Connection error") {
        showErrorDialog(context, responseJson);
        return;
      }
      dynamic response = jsonDecode(responseJson);
      setState(() {
        chatList = index == 0 ? response["privates"] : response["groups"];
        dataLoaded = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
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
      navigationBarIndex == 0
          ? SizedBox(
              width: MediaQuery.of(context).size.width,
              height: MediaQuery.of(context).size.height - 220,
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
          : Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                  Padding(
                      padding: EdgeInsets.only(
                          top: MediaQuery.of(context).size.height / 2 - 150)),
                  const Text(
                    "Group chat is under construction on mobile version\n\nYou can try it out in our web version!",
                    textAlign: TextAlign.center,
                  ),
                ]),
    ]);
  }
}
