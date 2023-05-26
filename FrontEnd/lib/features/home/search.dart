import 'dart:io';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

Future<Widget> searchUser(BuildContext context, input) async {
  dynamic query = {"username": input};
  dynamic userList = jsonDecode(
      await getRequest(EndPoints.searchUsers.endpoint, query))["users"];

  ListView list = ListView.builder(
      itemCount: userList.length,
      itemBuilder: (context, index) {
        String name = userList[index]["name"];
        String username = userList[index]["username"];
        return Column(
          children: [
            TextButton(
                onPressed: () async {
                  FocusManager.instance.primaryFocus?.unfocus();
                  dynamic data = await getRequest(
                          "${EndPoints.viewProfile.endpoint}/$username",
                          query);
                  AutoRouter.of(context).push(OthersProfileRoute(
                      data: jsonDecode(data)));
                },
                child: Column(
                  children: [
                    const Padding(padding: EdgeInsets.all(5)),
                    SizedBox(
                      width: MediaQuery.of(context).size.width,
                      child: Text(name),
                    ),
                    SizedBox(
                      width: MediaQuery.of(context).size.width,
                      child: Text(username),
                    ),
                  ],
                )),
            const Divider(
              height: 5,
              color: Colors.grey,
              indent: 10,
              endIndent: 10,
            )
          ],
        );
      });

  return Column(
    children: [
      SizedBox(
          width: MediaQuery.of(context).size.width, height: 400, child: list),
    ],
  );
}
