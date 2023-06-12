import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/features/friends/user_listview.dart';
import 'package:supercellmates/features/profile/tag_listview.dart';

Future<Widget> searchUser(BuildContext context, input) async {
  dynamic query = {"username": input};
  dynamic userList =
      jsonDecode(await getRequest(EndPoints.search.endpoint, query))["users"];

  Widget list = UserListView(userList: userList);

  return Column(
    children: [
      SizedBox(
          width: MediaQuery.of(context).size.width, height: 400, child: list),
    ],
  );
}

Future<Widget> searchTag(
    BuildContext context, bool tagLimitReached, input, onAddCallBack) async {
  dynamic query = {"tag": input};
  dynamic tagList = jsonDecode(
      await getRequest(EndPoints.searchTags.endpoint, query))["tags"];

  Widget list = TagListView(
    tagList: tagList,
    isAddTag: true,
    tagLimitReached: tagLimitReached,
    onAddCallBack: onAddCallBack,
  );

  return Column(
    children: [
      SizedBox(
          width: MediaQuery.of(context).size.width, height: 400, child: list),
    ],
  );
}
