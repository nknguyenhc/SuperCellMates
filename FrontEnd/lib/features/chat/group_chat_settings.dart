import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

@RoutePage()
class GroupChatSettingsPage extends StatefulWidget {
  const GroupChatSettingsPage(
      {Key? key, required this.chatInfo, required this.username})
      : super(key: key);

  final dynamic chatInfo;
  final String username;

  @override
  State<GroupChatSettingsPage> createState() => GroupChatSettingsPageState();
}

class GroupChatSettingsPageState extends State<GroupChatSettingsPage> {
  String role = "member";
  List<dynamic> members = [];
  List<dynamic> admins = [];
  int adminButtonIndex =
      -1; // 0: remove member, 1: assign admin, 2: remove admin, 3: appoint new leader
  String memberOrAdminTitle = "Group members";

  @override
  void initState() {
    super.initState();
    getMembers();
  }

  void getMembers() async {
    dynamic query = {
      "chatid": widget.chatInfo["id"],
    };
    List<dynamic> adminList = [];

    getRequest(EndPoints.getMembers.endpoint, query).then((responseJson) {
      if (responseJson == "connection error") {
        showErrorDialog(context, responseJson);
      }
      return jsonDecode(responseJson);
    }).then((response) {
      setState(() => members = response["users"]);
    }).then((value) {
      for (dynamic member in members) {
        if (member["role"] == "admin") {
          adminList.add(member);
        }
        if (member["username"] == widget.username) {
          setState(() => role = member["role"]);
        }
      }
    }).then((value) {
      setState(() {
        admins = adminList;
      });
    });
  }

  void navigateAdminButton(int index) {
    if (index == adminButtonIndex) {
      setState(() => adminButtonIndex = -1);
    } else {
      setState(() {
        adminButtonIndex = index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    memberOrAdminTitle = adminButtonIndex == 2 || adminButtonIndex == 3
        ? "Group admins"
        : "Group members";

    GridView membersGridView = GridView.builder(
        key: UniqueKey(),
        gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
            maxCrossAxisExtent: MediaQuery.of(context).size.width / 4,
            childAspectRatio: (MediaQuery.of(context).size.width / 4) /
                (MediaQuery.of(context).size.width / 4 + 25)),
        itemCount: adminButtonIndex == 2 || adminButtonIndex == 3
            ? admins.length
            : members.length + 1,
        itemBuilder: (context, index) {
          if (adminButtonIndex == 2 || adminButtonIndex == 3) {
            return Column(
              children: [
                Stack(
                  alignment: Alignment.topRight,
                  children: [
                    IconButton(
                        onPressed: () {
                          if (widget.username != admins[index]["username"]) {
                            context.router.push(OthersProfileRoute(
                                username: admins[index]["username"]));
                          }
                        },
                        icon: FutureBuilder(
                            future: getImage(admins[index]["profile_pic_url"]),
                            builder: (context, snapshot) {
                              if (snapshot.hasData) {
                                return snapshot.data!;
                              } else {
                                return const CircularProgressIndicator();
                              }
                            })),
                    widget.username != admins[index]["username"]
                        ? IconButton(
                            onPressed: () {
                              adminButtonIndex == 2
                                  ? showConfirmationDialog(context,
                                      "Are you sure to remove ${admins[index]["name"]}'s admin privileges?",
                                      () async {
                                      dynamic body = {
                                        "chatid": widget.chatInfo["id"],
                                        "username": admins[index]["username"]
                                      };
                                      dynamic response = await postWithCSRF(
                                          EndPoints.removeAdmin.endpoint, body);
                                      if (response == "ok") {
                                        showSuccessDialog(context,
                                            "Successfully removed ${admins[index]["name"]}'s admin previleges!");
                                        getMembers();
                                      } else {
                                        showErrorDialog(context, response);
                                      }
                                    })
                                  : showConfirmationDialogWithInput(
                                      context,
                                      "Are you sure to assign ${admins[index]["name"]} as the new leader?\n\nYou will become admin, and this action is irreversible.",
                                      "Your password", (password) {
                                      dynamic body = {
                                        "chatid": widget.chatInfo["id"],
                                        "username": admins[index]["username"],
                                        "password": password,
                                      };
                                      postWithCSRF(
                                              EndPoints.assignLeader.endpoint,
                                              body)
                                          .then((response) {
                                        if (response == "ok") {
                                          showSuccessDialog(super.context,
                                              "Successfully assigned ${admins[index]["name"]} as the new leader!");
                                          getMembers();
                                        } else {
                                          showErrorDialog(
                                              super.context, response);
                                        }
                                      });
                                    });
                            },
                            icon: Icon(
                              adminButtonIndex == 2 ? Icons.cancel : Icons.star,
                              color: adminButtonIndex == 2
                                  ? Colors.red
                                  : Colors.yellow,
                            ))
                        : Container()
                  ],
                ),
                Text(
                  admins[index]["name"],
                  style: const TextStyle(
                      color: Colors.blue, fontWeight: FontWeight.bold),
                ),
              ],
            );
          } else {
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                index == members.length
                    ? IconButton(
                        onPressed: () {
                          context.router.push(GroupChatInviteFriendRoute(
                              chatInfo: widget.chatInfo,
                              currMembers: members,
                              updateCallBack: getMembers));
                        },
                        iconSize: MediaQuery.of(context).size.width / 4 - 40,
                        icon: const Icon(Icons.add),
                        style: ButtonStyle(
                            shape: MaterialStatePropertyAll(
                                RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                    side: const BorderSide(
                                        color: Colors.black)))),
                      )
                    : Stack(
                        alignment: Alignment.topRight,
                        children: [
                          IconButton(
                              onPressed: () {
                                if (widget.username !=
                                    members[index]["username"]) {
                                  context.router.push(OthersProfileRoute(
                                      username: members[index]["username"]));
                                }
                              },
                              icon: FutureBuilder(
                                  future: getImage(
                                      members[index]["profile_pic_url"]),
                                  builder: (context, snapshot) {
                                    if (snapshot.hasData) {
                                      return snapshot.data!;
                                    } else {
                                      return const CircularProgressIndicator();
                                    }
                                  })),
                          widget.username != members[index]["username"] &&
                                  (adminButtonIndex == 0 && role == "creator" ||
                                      adminButtonIndex != -1 &&
                                          members[index]["role"] == "member")
                              ? IconButton(
                                  onPressed: () {
                                    showConfirmationDialog(
                                        context,
                                        adminButtonIndex == 0
                                            ? "Are you sure to remove ${members[index]["name"]} from this group?"
                                            : "Are you sure to assign ${members[index]["name"]} as admin?",
                                        () async {
                                      dynamic body = {
                                        "chatid": widget.chatInfo["id"],
                                        "username": members[index]["username"]
                                      };
                                      dynamic response = await postWithCSRF(
                                          adminButtonIndex == 0
                                              ? EndPoints.removeUser.endpoint
                                              : EndPoints.addAdmin.endpoint,
                                          body);
                                      if (response == "ok") {
                                        showSuccessDialog(
                                            context,
                                            adminButtonIndex == 0
                                                ? "Successfully removed ${members[index]["name"]} from this group!"
                                                : "Successfully assigned ${members[index]["name"]} as admin!");
                                        getMembers();
                                      } else {
                                        showErrorDialog(context, response);
                                      }
                                    });
                                  },
                                  icon: Icon(
                                    adminButtonIndex == 0
                                        ? Icons.cancel
                                        : Icons.add_circle,
                                    color: adminButtonIndex == 0
                                        ? Colors.red
                                        : Colors.blue,
                                  ),
                                )
                              : Container()
                        ],
                      ),
                Text(
                  index == members.length ? "" : members[index]["name"],
                  style: index == members.length
                      ? const TextStyle()
                      : TextStyle(
                          color: members[index]["role"] == "creator"
                              ? Colors.pink
                              : members[index]["role"] == "admin"
                                  ? Colors.blue
                                  : Colors.black,
                          fontWeight: members[index]["role"] == "creator" ||
                                  members[index]["role"] == "admin"
                              ? FontWeight.bold
                              : FontWeight.normal),
                ),
              ],
            );
          }
        });

    TextButton removeMemberButton = TextButton(
      onPressed: () => navigateAdminButton(0),
      style: ButtonStyle(
        backgroundColor: MaterialStatePropertyAll(
            adminButtonIndex == 0 ? Colors.blue : Colors.grey),
      ),
      child: const Text(
        "Remove member",
        style: TextStyle(color: Colors.white),
      ),
    );

    TextButton assignAdminButton = TextButton(
      onPressed: () => navigateAdminButton(1),
      style: ButtonStyle(
        backgroundColor: MaterialStatePropertyAll(
            adminButtonIndex == 1 ? Colors.blue : Colors.grey),
      ),
      child: const Text(
        "Assign admin",
        style: TextStyle(color: Colors.white),
      ),
    );

    Row manageMemberButtons = Row(
      children: [
        role == "admin" || role == "creator"
            ? removeMemberButton
            : const Text("You are not an admin of this chat"),
        const Padding(padding: EdgeInsets.only(right: 10)),
        role == "creator" ? assignAdminButton : Container(),
      ],
    );

    Column manageMemberSection = role == "admin" || role == "creator"
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(padding: EdgeInsets.only(top: 20)),
              const Text(
                "Manage members",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Padding(padding: EdgeInsets.only(top: 10)),
              manageMemberButtons,
            ],
          )
        : const Column();

    TextButton removeAdminButton = TextButton(
      onPressed: () => navigateAdminButton(2),
      style: ButtonStyle(
        backgroundColor: MaterialStatePropertyAll(
            adminButtonIndex == 2 ? Colors.blue : Colors.grey),
      ),
      child: const Text(
        "Remove admin",
        style: TextStyle(color: Colors.white),
      ),
    );

    TextButton assignLeaderButton = TextButton(
      onPressed: () => navigateAdminButton(3),
      style: ButtonStyle(
        backgroundColor: MaterialStatePropertyAll(
            adminButtonIndex == 3 ? Colors.blue : Colors.grey),
      ),
      child: const Text(
        "Assign new leader",
        style: TextStyle(color: Colors.white),
      ),
    );

    Row manageAdminButtons = Row(
      children: [
        removeAdminButton,
        const Padding(padding: EdgeInsets.only(right: 10)),
        assignLeaderButton,
      ],
    );

    Column manageAdminSection = role == "creator"
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(padding: EdgeInsets.only(top: 20)),
              const Text(
                "Manage Admins",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Padding(padding: EdgeInsets.only(top: 10)),
              manageAdminButtons,
            ],
          )
        : const Column();

    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: AppBar(
            titleSpacing: 0,
            title: const Text(
              "Group chat settings",
              style: const TextStyle(fontSize: 20),
            )),
        body: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                memberOrAdminTitle,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              SizedBox(
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.width * 0.7,
                child: membersGridView,
              ),
              manageMemberSection,
              manageAdminSection,
            ],
          ),
        ));
  }
}
