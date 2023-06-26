import 'package:flutter/material.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({Key? key}) : super(key: key);

  @override
  State<ChatPage> createState() => ChatPageState();
}

class ChatPageState extends State<ChatPage> {
  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      child:
          const Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Text(
          "Mobile version chat page is under construction!\n\nYou can try it out in our web version!",
          textAlign: TextAlign.center,
        ),
      ]),
    );
  }
}
