import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

@RoutePage()
class CreateGroupChatPage extends StatefulWidget {
  const CreateGroupChatPage({Key? key}) : super(key: key);

  @override
  State<CreateGroupChatPage> createState() => CreateGroupChatPageState();
}

class CreateGroupChatPageState extends State<CreateGroupChatPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            titleSpacing: 0,
            title: Text("Create group chat",
              style: const TextStyle(fontSize: 20),
            )),
        body: Container(
          alignment: Alignment.center,
          child: const Text(
            "CreateGroupChat page is under construction!",
          ),
        ));
  }
}
