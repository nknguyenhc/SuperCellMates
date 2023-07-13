import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:file_saver/file_saver.dart';
import 'package:requests/requests.dart';

import 'package:supercellmates/config/config.dart';

import 'package:get_it/get_it.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/functions/crop_image.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';
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
  bool inputEnabled = true;

  List<types.Message> messages = [];
  // memoised profile image urls
  // asynchronously mapped to IconButtons with icon being the image
  Map<String, dynamic> usernameToProfileImageUrl = {};

  bool showAttachmentMenu = false;
  final GlobalKey _menuKey =
      GlobalKey(); // dirty hack: for opening the popupmenu

  @override
  void initState() {
    super.initState();
    double currTimestamp = DateTime.now().microsecondsSinceEpoch / 1000000;
    loadMessages(currTimestamp - jump, currTimestamp);
    connect(0);
  }

  @override
  void dispose() {
    super.dispose();
    // close websocket connection
    if (wsChannel != null) {
      wsChannel!.sink.close();
    }
  }

  void loadMessages(double start, double end) async {
    if (end == 0) {
      return;
    }

    // get List<Dict> oldMessages
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

    // map old messages dicts to types.Message
    List<types.Message> oldMessagesList =
        oldMessages["messages"].map<types.Message>((m) {
      // load the message sender's profile picture, if absent
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
      // create corresponding types.Message
      if (m["type"] == "text") {
        return types.TextMessage(
            id: m["id"],
            author: types.User(
                id: m["user"]["username"],
                firstName: m["user"]["name"],
                imageUrl: m["user"]["profile_link"]),
            text: m["message"],
            createdAt: (m["timestamp"] * 1000).toInt() // in milliseconds,
            );
      } else {
        Future<Uint8List> futureImageData =
            getRawImageData("${EndPoints.getImage.endpoint}${m["id"]}");

        return types.CustomMessage(
            author: types.User(
                id: m["user"]["username"],
                firstName: m["user"]["name"],
                imageUrl: m["user"]["profile_link"]),
            id: m["id"],
            metadata: {
              "name": m["file_name"],
              "is_image": m["is_image"],
              "futureImageData": futureImageData
            });
      }
    }).toList();

    // update Chat widget
    setState(() {
      messages.addAll(oldMessagesList.reversed);
    });

    // ensure enough messages initially
    if (messages.length < 10) {
      loadMessages(nextLastTimestamp - jump, nextLastTimestamp);
    }
  }

  void connect(int count) {
    // connect websocket
    // count is the number of retries, max 3 tries before prompting error
    wsUrl = "${GetIt.I<Config>().wsBaseURL}/message/${widget.chatInfo["id"]}/";
    Requests.getStoredCookies(GetIt.I<Config>().restBaseURL)
        .then(
      (cookieJar) => cookieJar.delegate,
    )
        .then((cookieMap) {
      // extract cookies and initiate websocket connection
      setState(() {
        wsChannel = IOWebSocketChannel.connect(
          Uri.parse(wsUrl),
          headers: {
            "origin": "ws://10.0.2.2:8000",
            "cookie": "sessionid=${cookieMap["sessionid"]!.value}"
          },
          connectTimeout: const Duration(seconds: 2),
        );
      });
    }).then(
      (value) {
        // start stream listener, only once at initState
        // deal with new messages received right in this chat room
        wsChannel!.stream.listen((data) {
          dynamic messageMap = jsonDecode(data);

          // save message sender's profile image url, then load it, if haven't
          if (usernameToProfileImageUrl[messageMap["user"]["username"]] ==
              null) {
            getImage(messageMap["user"]["profile_img_url"])
                .then((image) => IconButton(
                    style: const ButtonStyle(
                        padding: MaterialStatePropertyAll(EdgeInsets.zero)),
                    onPressed: () async {
                      dynamic data = await getRequest(
                          "${EndPoints.viewProfile.endpoint}/${messageMap["user"]["username"]}",
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
                    usernameToProfileImageUrl[messageMap["user"]["username"]] =
                        button));
          }

          // create corresponding types.message
          if (messageMap["type"] == "text") {
            messages.insert(
                0,
                types.TextMessage(
                    author: types.User(
                        id: messageMap["user"]["username"],
                        firstName: messageMap["user"]["name"],
                        imageUrl: messageMap["user"]["profile_link"]),
                    id: messageMap["id"],
                    text: messageMap["message"],
                    createdAt: (messageMap["timestamp"] * 1000)
                        .toInt() // in milliseconds
                    ));
          } else {
            messages.insert(
                0,
                types.CustomMessage(
                    id: messageMap["id"],
                    author: types.User(
                        id: messageMap["user"]["username"],
                        firstName: messageMap["user"]["name"],
                        imageUrl: messageMap["user"]["profile_link"]),
                    metadata: {
                      "name": messageMap["file_name"],
                      "is_image": messageMap["is_image"],
                      "futureImageData": getRawImageData(
                          "${EndPoints.getImage.endpoint}${messageMap["id"]}"),
                    }));
          }

          // update Chat widget
          setState(() {
            messages = messages;
          });
        }, onError: (e) {
          if (e is! WebSocketChannelException) {
            showErrorDialog(context,
                "An error has occurred. Please try entering the chat again!");
          }
        }, onDone: () {
          if (wsChannel!.closeCode == 4003) {
            setState(() {
              inputEnabled = false;
            });
          } else if (count > 1) {
            showErrorDialog(context,
                "Failed to connect to the chat. Please try entering the chat again!");
          } else {
            connect(count + 1);
          }
        });
      },
    );
  }

  void _handleImageSelection() async {
    // "send image" function
    final result = await ImagePicker().pickImage(
      source: ImageSource.gallery,
    );

    if (result != null) {
      final croppedImage = await cropImage(result);
      if (croppedImage != null) {
        startUploadingDialog(context, "image");
        final bytes = await croppedImage.readAsBytes();

        dynamic body = {
          "chat_id": widget.chatInfo["id"],
          "file": bytes,
          "file_name": result.name,
        };

        String response =
            await postWithCSRF(EndPoints.uploadFile.endpoint, body);
        if (response == "Connection error") {
          stopLoadingDialog(context);
          Future.delayed(const Duration(milliseconds: 100))
              .then((v) => showErrorDialog(context, response));
          return;
        }
        dynamic messageMap = {
          "type": "file",
          "message_id": response,
        };
        wsChannel!.sink.add(jsonEncode(messageMap));
        stopLoadingDialog(context);
      }
    }
  }

  void _handleFileSelection() async {
    // "send_file" function
    final result = await FilePicker.platform.pickFiles(
      type: FileType.any,
    );

    if (result != null && result.files.single.path != null) {
      startUploadingDialog(context, "file");
      Uint8List fileBytes = await File(result.paths[0]!).readAsBytes();
      dynamic body = {
        "chat_id": widget.chatInfo["id"],
        "file": fileBytes,
        "file_name": result.files[0].name,
      };
      String response = await postWithCSRF(EndPoints.uploadFile.endpoint, body);
      if (response == "Connection error") {
        stopLoadingDialog(context);
        Future.delayed(const Duration(milliseconds: 100))
            .then((v) => showErrorDialog(context, response));
        return;
      }
      dynamic messageMap = {
        "type": "file",
        "message_id": response,
      };
      wsChannel!.sink.add(jsonEncode(messageMap));
      stopLoadingDialog(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    // PopupMenuButton that shows file type selection
    // showButtonMenu() called when user presses on attachment button
    final dummyButton = PopupMenuButton(
        key: _menuKey,
        iconSize: 0,
        offset: Offset.fromDirection(pi * 1.5, 50),
        onCanceled: () {
          FocusManager.instance.primaryFocus?.unfocus();
        },
        itemBuilder: (context) => <PopupMenuEntry>[
              PopupMenuItem(
                  height: 30,
                  onTap: () {
                    _handleFileSelection();
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
              const PopupMenuDivider(),
              PopupMenuItem(
                  height: 30,
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
            : Stack(children: [
                // Chat widget that contains the chat ui
                SizedBox(
                  width: MediaQuery.of(context).size.width,
                  child: Chat(
                    user: types.User(id: widget.username),
                    messages: messages,

                    onSendPressed: (s) {
                      dynamic messageMap;
                      if (s.text.isEmpty) {
                        showErrorDialog(context, "Message cannot be empty!");
                        return;
                      } else if (s.text.length > 700) {
                        messageMap = {
                          "type": "text",
                          "message": s.text.substring(0, 700),
                        };
                        showCustomDialog(context, "Message is too long",
                            "Only the first 700 characters were sent");
                      } else {
                        messageMap = {
                          "type": "text",
                          "message": s.text,
                        };
                      }
                      wsChannel!.sink.add(jsonEncode(messageMap));
                      setState(() {
                        messages = messages;
                      });
                    },
                    inputOptions: InputOptions(enabled: inputEnabled),

                    theme: DefaultChatTheme(
                        inputTextDecoration: inputEnabled
                            ? const InputDecoration(
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.zero,
                                isCollapsed: true,
                              )
                            : const InputDecoration(
                                labelText: "Add friend to send messages",
                                labelStyle: TextStyle(
                                    color: Colors.blueGrey,
                                    fontWeight: FontWeight.normal),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.zero,
                                isCollapsed: true,
                              ),
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
                                    width: 35,
                                    height: 35,
                                    child: usernameToProfileImageUrl[userId]),
                                const Padding(
                                    padding: EdgeInsets.only(right: 5))
                              ],
                            )
                          : const CircularProgressIndicator();
                    },

                    nameBuilder: (p0) => Text(p0.firstName ?? ""),

                    customMessageBuilder: (p0, {messageWidth = 1}) {
                      // build corresponding widget from metadata in customMessage instances
                      return FutureBuilder(
                          future: p0.metadata!["futureImageData"],
                          builder: (_, snap) {
                            if (snap.hasData) {
                              return p0.metadata!["is_image"]
                                  ? IconButton(
                                      constraints: BoxConstraints(
                                          maxWidth: MediaQuery.of(context)
                                                  .size
                                                  .width *
                                              0.7,
                                          maxHeight: MediaQuery.of(context)
                                                  .size
                                                  .height *
                                              0.3),
                                      onPressed: () => context.router.push(
                                          SinglePhotoViewer(
                                              photoBytes:
                                                  snap.data! as Uint8List,
                                              actions: [])),
                                      icon: Image.memory(
                                          snap.data! as Uint8List,
                                          fit: BoxFit.contain),
                                      padding: EdgeInsets.zero,
                                    )
                                  : TextButton(
                                      onPressed: () {
                                        int dotIndex = p0.metadata!["name"]
                                            .lastIndexOf('.');
                                        String fileName = dotIndex == -1
                                            ? p0.metadata!["name"]
                                            : p0.metadata!["name"]
                                                .substring(0, dotIndex);
                                        String extension = dotIndex == -1
                                            ? ""
                                            : p0.metadata!["name"]
                                                .substring(dotIndex + 1);
                                        FileSaver.instance.saveAs(
                                            name: fileName,
                                            bytes: snap.data! as Uint8List,
                                            ext: extension,
                                            mimeType: MimeType.other);
                                      },
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(
                                            Icons.file_present,
                                            size: 20,
                                          ),
                                          const Padding(
                                              padding:
                                                  EdgeInsets.only(right: 5)),
                                          Container(
                                              constraints: BoxConstraints(
                                                  maxWidth:
                                                      MediaQuery.of(context)
                                                              .size
                                                              .width *
                                                          0.5),
                                              child: Text(
                                                p0.metadata!["name"],
                                                style: const TextStyle(
                                                    color: Colors.indigo,
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.bold,
                                                    decoration: TextDecoration
                                                        .underline),
                                              )),
                                        ],
                                      ));
                            }
                            return const CircularProgressIndicator();
                          });
                    },

                    onEndReached: () {
                      return Future(() => loadMessages(
                          nextLastTimestamp - jump, nextLastTimestamp));
                    },
                    onEndReachedThreshold: 0.8,
                    isLastPage: nextLastTimestamp == 0,

                    onAttachmentPressed: inputEnabled
                        ? () {
                            dynamic state = _menuKey.currentState;
                            state.showButtonMenu();
                          }
                        : () {},
                  ),
                ),
                Positioned(
                  bottom: 60,
                  left: 20,
                  child: dummyButton,
                ),
              ]));
  }
}
