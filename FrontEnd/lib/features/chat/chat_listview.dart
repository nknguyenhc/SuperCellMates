import 'dart:typed_data';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/router/router.gr.dart';

class ChatListView extends StatefulWidget {
  const ChatListView({
    Key? key,
    required this.username,
    required this.chatList,
    required this.isPrivate,
  }) : super(key: key);

  final String username;
  final dynamic chatList;
  final bool isPrivate;

  @override
  State<ChatListView> createState() => ChatListViewState();
}

class ChatListViewState extends State<ChatListView> {
  int count = 0;
  var dataLoaded = [];
  var chatIcons = [];

  @override
  void initState() {
    super.initState();
    count = widget.chatList.length;
    dataLoaded = List<bool>.filled(count, false, growable: true);
    chatIcons =
        List<Uint8List?>.filled(count, Uint8List.fromList([]), growable: true);
    for (int i = 0; i < count; i++) {
      loadImage(i);
    }
  }

  void loadImage(index) async {
    chatIcons[index] = widget.isPrivate
        ? await getRawImageData(
            widget.chatList[index]["user"]["profile_img_url"])
        : null; // group rep image
    setState(() {
      dataLoaded[index] = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        itemCount: count,
        itemBuilder: (context, index) {
          String name = widget.chatList[index]["user"]["name"];
          return Column(
            children: [
              TextButton(
                onPressed: () async {
                  // FocusManager.instance.primaryFocus?.unfocus();
                  widget.isPrivate
                      ? context.router.push(PrivateChatRoute(
                          username: widget.username,
                          chatInfo: widget.chatList[index]))
                      : context.router.push(GroupChatRoute());
                },
                child: Row(children: [
                  SizedBox(
                    height: 45,
                    width: 45,
                    child: dataLoaded[index]
                        ? IconButton(
                            onPressed: () {
                              AutoRouter.of(context).push(SinglePhotoViewer(
                                  photoBytes: chatIcons[index], actions: []));
                            },
                            icon: Image.memory(chatIcons[index]),
                            iconSize: 45,
                            padding: EdgeInsets.zero,
                          )
                        : const CircularProgressIndicator(),
                  ),
                  const Padding(padding: EdgeInsets.all(6)),
                  Column(
                    children: [
                      const Padding(padding: EdgeInsets.only(left: 2)),
                      SizedBox(
                        width: MediaQuery.of(context).size.width - 150,
                        child: Text(
                          name,
                          style: const TextStyle(
                              color: Colors.black, fontSize: 15),
                        ),
                      ),
                    ],
                  ),
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
    return count > 0
        ? list
        : widget.isPrivate
            ? const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "You have not added any friend yet.",
                    textAlign: TextAlign.center,
                  )
                ],
              )
            : const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "You have not joined any group.",
                    textAlign: TextAlign.center,
                  ),
                  Padding(padding: EdgeInsets.only(bottom: 80))
                ],
              );
  }
}
