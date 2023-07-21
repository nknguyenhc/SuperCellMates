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
      title: const Text(
        "   My chats",
        style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
      ),
      backgroundColor: Colors.lightBlue,
      titleSpacing: 10,
      toolbarHeight: 80,
    );
  }
}
