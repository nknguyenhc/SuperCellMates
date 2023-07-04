import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:supercellmates/features/chat/chat_listview.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({Key? key}) : super(key: key);

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
    responseJson = index == 0
        ? await getRequest(EndPoints.getPrivateChats.endpoint, null)
        : "Connection error";
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
      !dataLoaded
          ? const CircularProgressIndicator()
          : SizedBox(
              width: MediaQuery.of(context).size.width,
              height: MediaQuery.of(context).size.height - 220,
              child: ChatListView(chatList: chatList, isPrivate: navigationBarIndex == 0,)),
    ]);
  }
}
