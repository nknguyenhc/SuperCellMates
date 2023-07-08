import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:image_picker/image_picker.dart';
import 'package:requests/requests.dart';

import 'package:supercellmates/config/config.dart';

import 'package:get_it/get_it.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/status.dart' as status;
import 'package:flutter_chat_ui/flutter_chat_ui.dart';
import 'package:flutter_chat_types/flutter_chat_types.dart' as types;
import 'package:intl/intl.dart';

@RoutePage()
class PrivateChatPage extends StatefulWidget {
  const PrivateChatPage(
      {Key? key, required this.username, required this.chatInfo})
      : super(key: key);

  final String username;
  final dynamic chatInfo;

  @override
  State<PrivateChatPage> createState() => _PrivateChatPageState();
}

class _PrivateChatPageState extends State<PrivateChatPage> {
  String wsUrl = "";
  WebSocketChannel? wsChannel;
  final int jump = 60; // seconds within which a batch of messages are loaded
  double nextLastTimestamp = 0;
  final _controller = ScrollController();

  List<types.Message> messages = [];
  Map<String, dynamic> usernameToProfileImageUrl = {};

  bool showAttachmentMenu = false;
  final GlobalKey _menuKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      if (_controller.position.atEdge) {
        bool isTop = _controller.position.pixels == 0;
        if (isTop) {
          loadMessages(nextLastTimestamp - jump, nextLastTimestamp);
        }
      }
    });
    double currTimestamp = DateTime.now().microsecondsSinceEpoch / 1000000;
    loadMessages(currTimestamp - jump, currTimestamp);
    connect();
  }

  @override
  void dispose() {
    super.dispose();
    if (wsChannel != null) {
      wsChannel!.sink.close();
    }
  }

  void loadMessages(double start, double end) async {
    if (end == 0) {
      return;
    }
    dynamic queryDict = {
      "start": start,
      "end": end,
    };
    dynamic oldMessagesJson = await getRequest(
        "${EndPoints.getPrivateMessages.endpoint}${widget.chatInfo["id"]}",
        queryDict);
    if (oldMessagesJson == "Connection error") {
      showErrorDialog(context, oldMessagesJson);
      return;
    }
    dynamic oldMessages = jsonDecode(oldMessagesJson);
    if (oldMessages["next_last_timestamp"] == 0) {
      nextLastTimestamp = 0;
    } else {
      nextLastTimestamp = oldMessages["next_last_timestamp"];
    }
    List<types.Message> oldMessagesList =
        oldMessages["messages"].map<types.Message>((m) {
      if (usernameToProfileImageUrl[m["user"]["username"]] == null) {
        usernameToProfileImageUrl[m["user"]["username"]] =
            const CircularProgressIndicator();
        getImage(m["user"]["profile_img_url"])
            .then((image) => IconButton(
                style: const ButtonStyle(
                    padding: MaterialStatePropertyAll(EdgeInsets.zero)),
                onPressed: () async {
                  dynamic data = await getRequest(
                      "${EndPoints.viewProfile.endpoint}/${m["user"]["username"]}",
                      null);
                  if (data == "Connection error") {
                    showErrorDialog(context, data);
                    return;
                  }
                  AutoRouter.of(context)
                      .push(OthersProfileRoute(data: jsonDecode(data)));
                },
                icon: image))
            .then((button) => setState(() =>
                usernameToProfileImageUrl[m["user"]["username"]] = button));
      }
      return types.TextMessage(
          id: m["id"],
          author: types.User(
              id: m["user"]["username"],
              firstName: m["user"]["name"],
              imageUrl: m["user"]["profile_link"]),
          text: m["message"],
          createdAt: (m["timestamp"] * 1000).toInt() // in milliseconds,
          );
    }).toList();
    setState(() {
      messages.addAll(oldMessagesList.reversed);
    });
    if (messages.length < 10) {
      loadMessages(nextLastTimestamp - jump, nextLastTimestamp);
    }
  }

  void connect() async {
    wsUrl = "${GetIt.I<Config>().wsBaseURL}/message/${widget.chatInfo["id"]}/";
    Requests.getStoredCookies(GetIt.I<Config>().restBaseURL)
        .then(
      (cookieJar) => cookieJar.delegate,
    )
        .then((cookieMap) {
      setState(() {
        wsChannel = IOWebSocketChannel.connect(Uri.parse(wsUrl), headers: {
          "origin": "ws://10.0.2.2:8000",
          "cookie": "sessionid=${cookieMap["sessionid"]!.value}"
        });
      });
    });
  }

  void _handleImageSelection() async {
    final result = await ImagePicker().pickImage(
      source: ImageSource.gallery,
    );

    if (result != null) {
      final bytes = await result.readAsBytes();

      dynamic body = {
        "chat_id": widget.chatInfo["id"],
        "file": bytes,
        "file_name": result.name,
      };

      String response = await postWithCSRF(EndPoints.uploadFile.endpoint, body);
      if (response == "Connection error") {
        showErrorDialog(context, response);
        return;
      }

      dynamic messageMap = {
        "type": "file",
        "message_id": response,
      };
      wsChannel!.sink.add(messageMap);
    }
  }

  @override
  Widget build(BuildContext context) {
    // PopupMenuButton that shows file type selection
    // onButtonPressed called when user presses on attachment button
    final dummyButton = PopupMenuButton(
        key: _menuKey,
        iconSize: 0,
        offset: Offset.fromDirection(pi * 1.5, 60),
        itemBuilder: (context) => <PopupMenuEntry>[
              PopupMenuItem(
                  height: 40,
                  onTap: () {
                    print(1);
                  },
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "send file",
                        style: TextStyle(fontSize: 15),
                      ),
                    ],
                  )),
              PopupMenuItem(
                  height: 40,
                  onTap: () {
                    _handleImageSelection();
                  },
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "send image",
                        style: TextStyle(fontSize: 15),
                      ),
                    ],
                  ))
            ]);

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
        body: wsChannel == null
            ? const CircularProgressIndicator()
            : StreamBuilder(
                stream: wsChannel!.stream,
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    dynamic messageMap = jsonDecode(snapshot.data);
                    if (usernameToProfileImageUrl[messageMap["user"]
                            ["username"]] ==
                        null) {
                      getImage(messageMap["user"]["profile_img_url"])
                          .then((image) => IconButton(
                              style: const ButtonStyle(
                                  padding: MaterialStatePropertyAll(
                                      EdgeInsets.zero)),
                              onPressed: () async {
                                dynamic data = await getRequest(
                                    "${EndPoints.viewProfile.endpoint}/${messageMap["user"]["username"]}",
                                    null);
                                if (data == "Connection error") {
                                  showErrorDialog(context, data);
                                  return;
                                }
                                AutoRouter.of(context).push(
                                    OthersProfileRoute(data: jsonDecode(data)));
                              },
                              icon: image))
                          .then((button) => setState(() =>
                              usernameToProfileImageUrl[messageMap["user"]
                                  ["username"]] = button));
                    }
                    types.Message message = types.TextMessage(
                        author: types.User(
                            id: messageMap["user"]["username"],
                            firstName: messageMap["user"]["name"],
                            imageUrl: messageMap["user"]["profile_link"]),
                        id: messageMap["id"],
                        text: messageMap["message"],
                        createdAt: (messageMap["timestamp"] * 1000)
                            .toInt() // in milliseconds
                        );
                    messages.insert(0, message);
                  }
                  return Stack(children: [
                    SizedBox(
                      width: MediaQuery.of(context).size.width,
                      child: Chat(
                        user: types.User(id: widget.username),
                        messages: messages,
                        onSendPressed: (s) {
                          dynamic messageMap = {
                            "type": "text",
                            "message": s.text,
                          };
                          wsChannel!.sink.add(jsonEncode(messageMap));
                        },
                        theme: DefaultChatTheme(
                            primaryColor: Colors.blue,
                            secondaryColor: Colors.pinkAccent,
                            inputBackgroundColor: Colors.white,
                            inputMargin: const EdgeInsets.only(
                                left: 20, right: 20, bottom: 20),
                            inputPadding: const EdgeInsets.all(15),
                            inputTextColor: Colors.black,
                            messageInsetsHorizontal: 12,
                            messageInsetsVertical: 12,
                            inputContainerDecoration: BoxDecoration(
                                borderRadius:
                                    const BorderRadius.all(Radius.circular(15)),
                                border: Border.all()),
                            attachmentButtonMargin: EdgeInsets.zero),
                        dateFormat: DateFormat('dd/MM/yy'),
                        dateHeaderThreshold: 5 * 60 * 1000, // 5 minutes
                        showUserAvatars: true,
                        showUserNames: false,
                        avatarBuilder: (userId) {
                          return usernameToProfileImageUrl[userId] != null
                              ? Row(
                                  children: [
                                    SizedBox(
                                        width: 30,
                                        height: 30,
                                        child:
                                            usernameToProfileImageUrl[userId]),
                                    const Padding(
                                        padding: EdgeInsets.only(right: 10))
                                  ],
                                )
                              : const CircularProgressIndicator();
                        },
                        nameBuilder: (p0) => Text(p0.firstName ?? ""),
                        onEndReached: () => Future(() => loadMessages(
                            nextLastTimestamp - jump, nextLastTimestamp)),
                        isLastPage: nextLastTimestamp == 0,
                        onAttachmentPressed: () {
                          setState(() {
                            dynamic state = _menuKey.currentState;
                            state.showButtonMenu();
                          });
                        },
                      ),
                    ),
                    Positioned(
                      child: dummyButton,
                      bottom: 60,
                      left: 20,
                    ),
                  ]);
                }));
  }
}
