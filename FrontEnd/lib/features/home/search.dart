import 'package:flutter/material.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'dart:convert';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/features/friends/user_listview.dart';
import 'package:supercellmates/features/profile/tag_listview.dart';

Future<Widget> searchUser(BuildContext context, input) async {
  dynamic query = {"username": input};
  dynamic userListJson = await getRequest(EndPoints.search.endpoint, query);
  if (userListJson == "Connection error") {
    showErrorDialog(context, userListJson);
    return Container();
  }
  dynamic userList = jsonDecode(userListJson)["users"];

  Widget list = userList.length > 0 && userList.length <= 20
      ? UserListView(
          userList: userList,
          updateCallBack: () {},
        )
      : Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              userList.length == 0
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

Future<Widget> searchTag(
    BuildContext context, bool tagLimitReached, input, onAddCallBack) async {
  dynamic query = {"tag": input};
  dynamic tagListJson = await getRequest(EndPoints.searchTags.endpoint, query);
  if (tagListJson == "Connection error") {
    showErrorDialog(context, tagListJson);
    return Container();
  }
  dynamic tagList = jsonDecode(tagListJson)["tags"];

  Widget list = TagListView(
    tagList: tagList,
    isAddTag: true,
    tagLimitReached: tagLimitReached,
    onAddCallBack: onAddCallBack,
  );

  return Column(
    key: UniqueKey(),
    children: [
      SizedBox(
          width: MediaQuery.of(context).size.width,
          height: MediaQuery.of(context).size.height - 230,
          child: list),
    ],
  );
}
