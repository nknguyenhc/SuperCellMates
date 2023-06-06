import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:supercellmates/features/friends/user_listview.dart';

Future<Widget> searchUser(BuildContext context, input) async {
  dynamic query = {"username": input};
  dynamic userList = jsonDecode(
      await getRequest(EndPoints.search.endpoint, query))["users"];

  Widget list = UserListView(userList: userList);

  return Column(
    children: [
      SizedBox(
          width: MediaQuery.of(context).size.width, height: 400, child: list),
    ],
  );
}
