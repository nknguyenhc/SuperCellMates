import "package:flutter/material.dart";

class ChatAppBar extends AppBar {
  ChatAppBar({Key? key}) : super(key: key);

  @override
  State<ChatAppBar> createState() => ChatAppBarState();
}

class ChatAppBarState extends State<ChatAppBar> {
  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Container(
        alignment: Alignment.center,
        child: const Text(
          "My chats",
          style: TextStyle(
              fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      backgroundColor: Colors.lightBlue,
      titleSpacing: 10,
      toolbarHeight: 80,
    );
  }
}
