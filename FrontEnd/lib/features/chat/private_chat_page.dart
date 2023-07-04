import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

import 'package:supercellmates/config/config.dart';

import 'package:get_it/get_it.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

@RoutePage()
class PrivateChatPage extends StatefulWidget {
  const PrivateChatPage({Key? key, required this.chatInfo}) : super(key: key);

  final dynamic chatInfo;

  @override
  State<PrivateChatPage> createState() => PrivateChatPageState();
}

class PrivateChatPageState extends State<PrivateChatPage> {
  String wsUrl = "";
  WebSocketChannel? wsChannel;

  @override
  void initState() {
    super.initState();
    wsUrl =
        "${GetIt.I<Config>().wsBaseURL}/message/${widget.chatInfo["id"]}/";
    print(wsUrl);
    wsChannel = WebSocketChannel.connect(Uri.parse(wsUrl));
  }

  @override
  void dispose() {
    super.dispose();
    if (wsChannel != null) {
      wsChannel!.sink.close();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.only(right: 55, top: 1),
              child: Text(
                widget.chatInfo["user"]["name"],
                style: const TextStyle(fontSize: 18),
              )),
          shape: const Border(
              bottom: BorderSide(color: Colors.blueGrey, width: 0.7)),
        ),
        body: Container(
            alignment: Alignment.center,
            child: TextButton(
              onPressed: () {
                wsChannel!.sink.add("Hello");
              },
              child: const Text("test send"),
            )));
  }
}
