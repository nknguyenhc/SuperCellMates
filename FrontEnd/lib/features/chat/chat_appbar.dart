import "package:auto_route/auto_route.dart";
import "package:flutter/material.dart";
import "package:supercellmates/router/router.gr.dart";

class ChatAppBar extends AppBar {
  ChatAppBar({Key? key}) : super(key: key);

  @override
  State<ChatAppBar> createState() => ChatAppBarState();
}

class ChatAppBarState extends State<ChatAppBar> {
  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text("   My chats",
      style: TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.bold
      ),),
      backgroundColor: Colors.lightBlue,
      titleSpacing: 10,
      toolbarHeight: 80,
      actions: [
        IconButton(
          onPressed: () {
            context.router.push(CreateGroupChatRoute());
          },
          icon: const Icon(
            Icons.add,
          ),
          style: const ButtonStyle(iconSize: MaterialStatePropertyAll(40)),
        ),
        const Padding(padding: EdgeInsets.only(right: 10))
      ],
    );
  }
}
