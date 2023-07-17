import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'dart:async';

import 'package:easy_search_bar/easy_search_bar.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/features/friends/user_listview.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

@RoutePage()
class GroupChatInviteFriendPage extends StatefulWidget {
  const GroupChatInviteFriendPage({
    Key? key,
    required this.chatInfo,
    required this.currMembers,
    required this.updateCallBack,
  }) : super(key: key);

  final dynamic chatInfo;
  final List<dynamic> currMembers;
  final dynamic updateCallBack;

  @override
  State<GroupChatInviteFriendPage> createState() =>
      GroupChatInviteFriendPageState();
}

class GroupChatInviteFriendPageState extends State<GroupChatInviteFriendPage> {
  Timer? _searchTimer;

  Widget defaultBody = Container(
    alignment: Alignment.center,
    child: const Text(
      "Use the search button above to invite friends!\n\nOnly those not in this group will be shown.",
      textAlign: TextAlign.center,
    ),
  );

  Widget body = Container();

  @override
  void initState() {
    super.initState();
    body = defaultBody;
  }

  void setBody(Widget newBody) {
    setState(() {
      body = newBody;
    });
  }

  Future<Widget> searchFriend(BuildContext context, String input) async {
    dynamic query = {"username": input};
    dynamic userListJson =
        await getRequest(EndPoints.searchFriend.endpoint, query);
    if (userListJson == "Connection error") {
      showErrorDialog(context, userListJson);
      return Container();
    }
    dynamic userList = jsonDecode(userListJson)["users"];
    List<dynamic> nonMemberList = [];

    for (dynamic user in userList) {
      bool isMember = false;
      for (dynamic member in widget.currMembers) {
        if (user["username"] == member["username"]) {
          isMember = true;
          break;
        }
      }
      if (!isMember) {
        nonMemberList.add(user);
      }
    }

    Widget list = nonMemberList.isNotEmpty && nonMemberList.length <= 20
        ? UserListViewWithCustomOnPressed(
            userList: userList,
            updateCallBack: () {},
            onPressed: (dynamic userInfo) {
              showConfirmationDialog(
                  context, "Are you sure to invite ${userInfo["name"]}?", () {
                dynamic body = {
                  "username": userInfo["username"],
                  "chat_id": widget.chatInfo["id"],
                };
                postWithCSRF(EndPoints.addMember.endpoint, body)
                    .then((response) {
                  if (response == "ok") {
                    widget.updateCallBack();
                    context.router
                        .popUntilRouteWithName(GroupChatSettingsRoute.name);
                    showSuccessDialog(context, "Successfully invited friend");
                  } else {
                    showErrorDialog(context, response);
                  }
                });
              });
            },
          )
        : Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                nonMemberList.isEmpty
                    ? "No results for this search."
                    : "Please be more specific in your search",
                textAlign: TextAlign.center,
              ),
            ],
          );

    return Column(
      key: UniqueKey(),
      children: [
        SizedBox(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height - 170,
            child: list),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: EasySearchBar(
          onSearch: (input) {
            if (input == "") {
              setBody(defaultBody);
              return;
            }
            if (_searchTimer == null || !_searchTimer!.isActive) {
              _searchTimer =
                  Timer(const Duration(milliseconds: 1000), () async {
                setBody(await searchFriend(context, input));
              });
            } else {
              _searchTimer!.cancel();
              _searchTimer =
                  Timer(const Duration(milliseconds: 1000), () async {
                setBody(await searchFriend(context, input));
              });
            }
          },
          title: Text(
            "Invite friend to ${widget.chatInfo["name"]}",
            style: const TextStyle(fontSize: 20),
          ),
          searchHintText: "Search by username...",
          backgroundColor: Colors.white,
          appBarHeight: 80,
          elevation: 0,
          titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
        ),
        body: body);
  }
}
