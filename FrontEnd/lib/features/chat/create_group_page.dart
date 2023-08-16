import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'dart:async';

import 'package:easy_search_bar/easy_search_bar.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/features/friends/user_listview.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

@RoutePage()
class CreateGroupPage extends StatefulWidget {
  const CreateGroupPage({
    Key? key,
    required this.updateCallBack,
  }) : super(key: key);

  final dynamic updateCallBack;

  @override
  State<CreateGroupPage> createState() => CreateGroupPageState();
}

class CreateGroupPageState extends State<CreateGroupPage> {
  Timer? _searchTimer;
  List<dynamic> currMembers = [];
  String groupName = "";
  double searchResultHeight = 250;
  Widget searchResult = Container();

  @override
  void initState() {
    super.initState();
    searchResult = _buildDefaultSearchResult();
  }

  void setSearchResult(Widget newResult) {
    setState(() {
      searchResult = newResult;
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
      for (dynamic member in currMembers) {
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
              setState(() {
                currMembers.add(userInfo);
                setSearchResult(_buildDefaultSearchResult());
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
            height: searchResultHeight,
            child: list),
      ],
    );
  }

  Widget _buildGroupNameSection() {
    return TextField(
      maxLength: 25,
      decoration: const InputDecoration(
          border: OutlineInputBorder(),
          hintText: "Group name",
          hintStyle: TextStyle(color: Colors.grey, fontSize: 14)),
      style: const TextStyle(
        fontSize: 14,
      ),
      onChanged: (input) {
        groupName = input;
      },
    );
  }

  Widget _buildDefaultSearchResult() {
    return Container(
      height: searchResultHeight,
      alignment: Alignment.center,
      child: const Text(
        "Use the search button above to invite friends!",
        textAlign: TextAlign.center,
      ),
    );
  }

  Widget _buildSubmitButton() {
    return TextButton(
        onPressed: () {
          if (groupName == "") {
            showErrorDialog(context, "Group name cannot be empty!");
          } else if (currMembers.length < 2) {
            showErrorDialog(context, "Group must contain at least 3 users");
          } else {
            showConfirmationDialog(
                context, "Are you sure to create this group?", () {
              dynamic body = {
                "users_async": jsonEncode(currMembers
                    .map(
                      (e) => e["username"],
                    )
                    .toList()),
                "group_name": groupName,
              };
              postWithCSRF(EndPoints.createGroupChat.endpoint, body)
                  .then((responseJson) {
                if (responseJson.indexOf("timestamp") == -1) {
                  showErrorDialog(context, responseJson);
                } else {
                  //dynamic response = jsonDecode(responseJson);
                  context.router.popUntilRoot();
                  showSuccessDialog(context, "Successfully created group!");
                  widget.updateCallBack();
                }
              });
            });
          }
        },
        style: const ButtonStyle(
            backgroundColor: MaterialStatePropertyAll(Colors.blue)),
        child: const Text(
          "Submit",
          style: TextStyle(color: Colors.white),
        ));
  }

  Widget _buildMembersPreviewSection() {
    return ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: currMembers.length,
        itemBuilder: (context, index) {
          return FutureBuilder(
            future: getRawImageData(currMembers[index]["profile_pic_url"], false),
            builder: (context, snapshot) {
              return Column(
                children: [
                  Stack(
                    alignment: Alignment.topRight,
                    children: [
                      IconButton(
                          onPressed: () => context.router.push(
                              OthersProfileRoute(
                                  username: currMembers[index]["username"])),
                          icon: snapshot.hasData
                              ? Image.memory(snapshot.data!,
                                  width: 60, height: 60)
                              : const CircularProgressIndicator()),
                      Positioned(
                        top: 0.0,
                        right: 0.0,
                        child: IconButton(
                          padding: EdgeInsets.zero,
                          onPressed: () => setState(() {
                            currMembers.removeAt(index);
                          }),
                          icon: Icon(Icons.cancel, size: 20, color: Colors.red),
                        ),
                      )
                    ],
                  ),
                  Container(
                    width: 60,
                    alignment: Alignment.center,
                    child: Text(
                      currMembers[index]["name"],
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              );
            },
          );
        });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: EasySearchBar(
          onSearch: (input) {
            if (input == "") {
              setSearchResult(_buildDefaultSearchResult());
              return;
            }
            if (_searchTimer == null || !_searchTimer!.isActive) {
              _searchTimer =
                  Timer(const Duration(milliseconds: 1000), () async {
                setSearchResult(await searchFriend(context, input));
              });
            } else {
              _searchTimer!.cancel();
              _searchTimer =
                  Timer(const Duration(milliseconds: 1000), () async {
                setSearchResult(await searchFriend(context, input));
              });
            }
          },
          title: const Text(
            "Create new group",
            style: TextStyle(fontSize: 20),
          ),
          searchHintText: "Search by username...",
          backgroundColor: Colors.white,
          appBarHeight: 80,
          elevation: 0,
          titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
        ),
        body: SingleChildScrollView(
            child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(30, 10, 30, 10),
              child: _buildGroupNameSection(),
            ),
            searchResult,
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
              child: SizedBox(
                height: 100,
                child: _buildMembersPreviewSection(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(25, 5, 20, 0),
              child: _buildSubmitButton(),
            ),
          ],
        )));
  }
}
