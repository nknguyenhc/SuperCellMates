import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:supercellmates/functions/notifications.dart';
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
  List<Future> listOfLoadImageFutures = [];
  Notifications notifications = GetIt.I<Notifications>();

  @override
  void initState() {
    super.initState();
    count = widget.chatList.length;
    for (int i = 0; i < count; i++) {
      listOfLoadImageFutures.add(
        getRawImageData(widget.isPrivate
            ? widget.chatList[i]["user"]["profile_img_url"]
            : widget.chatList[i]["img"]),
      );
    }
  }

  Widget buildUnreadIcon(bool isPrivate, String chatID) {
    return ListenableBuilder(
      listenable: notifications,
      builder: (context, child) {
        if (widget.isPrivate) {
          for (String id in notifications.unreadPrivateChats) {
            if (id == chatID) {
              return unreadIcon;
            }
          }
        } else {
          for (String id in notifications.unreadGroupChats) {
            if (id == chatID) {
              return unreadIcon;
            }
          }
        }
        return Container();
      },
    );
  }

  Widget chatDivider = const Divider(
    height: 1,
    thickness: 2,
    color: Colors.black12,
    indent: 10,
    endIndent: 10,
  );

  Widget unreadIcon = const Icon(
    Icons.circle,
    color: Colors.red,
    size: 12,
  );

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        itemCount: count,
        itemBuilder: (context, index) {
          Map chatInfo = widget.chatList[index];
          String chatID = chatInfo["id"];
          String name =
              widget.isPrivate ? chatInfo["user"]["name"] : chatInfo["name"];

          Widget profileImage = SizedBox(
              height: 45,
              width: 45,
              child: FutureBuilder(
                  future: listOfLoadImageFutures[index],
                  builder: (context, snapshot) {
                    return snapshot.hasData
                        ? IconButton(
                            onPressed: () {
                              AutoRouter.of(context).push(SinglePhotoViewer(
                                  photoBytes: snapshot.data!, actions: []));
                            },
                            icon: Image.memory(snapshot.data!),
                            iconSize: 45,
                            padding: EdgeInsets.zero,
                          )
                        : const CircularProgressIndicator();
                  }));

          Widget nameText = SizedBox(
            width: MediaQuery.of(context).size.width - 100,
            child: Text(
              name,
              style: const TextStyle(color: Colors.black, fontSize: 15),
            ),
          );

          return Column(
            children: [
              TextButton(
                onPressed: () async {
                  if (widget.isPrivate) {
                    notifications.readChat("private", chatID);
                    context.router
                        .push(ChatRoomRoute(
                            username: widget.username,
                            chatInfo: chatInfo,
                            isPrivate: true))
                        .then(
                      (value) {
                        notifications.update();
                      },
                    );
                  } else {
                    notifications.readChat("group", chatID);
                    context.router
                        .push(ChatRoomRoute(
                      username: widget.username,
                      chatInfo: chatInfo,
                      isPrivate: false,
                    ))
                        .then((value) {
                      notifications.update();
                    });
                  }
                },
                child: Row(children: [
                  profileImage,
                  const Padding(padding: EdgeInsets.all(6)),
                  nameText,
                  buildUnreadIcon(widget.isPrivate, chatID),
                ]),
              ),
              chatDivider,
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
