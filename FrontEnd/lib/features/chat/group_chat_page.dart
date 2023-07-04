import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

@RoutePage()
class GroupChatPage extends StatefulWidget {
  const GroupChatPage({Key? key}) : super(key: key);

  @override
  State<GroupChatPage> createState() => GroupChatPageState();
}

class GroupChatPageState extends State<GroupChatPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            titleSpacing: 0,
            title: Text("Group chat",
              style: const TextStyle(fontSize: 20),
            )),
        body: Container(
          alignment: Alignment.center,
          child: const Text(
            "GroupChat page is under construction!",
          ),
        ));
  }
}
