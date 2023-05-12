import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:sweet_cookie_jar/sweet_cookie_jar.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/router/router.gr.dart';

import 'dart:io';
import 'dart:convert';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppBar(
          actions: [
            IconButton(
              onPressed: () async {
                String uri = "http://127.0.0.1/8000";
                SweetCookieJar cookies = SweetCookieJar.from(
                    response: await http.get(Uri.parse(uri)));
                Cookie cookie = cookies.find(name: 'csrftoken');
                print(cookie);
              },

              //AutoRouter.of(context).push(const FriendRequestRoute()),
              icon: const Icon(Icons.people),
              iconSize: 25,
            ),
            Container(padding: const EdgeInsets.all(10)),
          ],
        ),
        Expanded(
          child: Container(
            height: 100,
            alignment: Alignment.center,
            child: const Text("Home page body"),
          ),
        )
      ],
    );
  }
}
