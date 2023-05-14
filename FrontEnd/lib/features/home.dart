import 'package:flutter/material.dart';

import 'package:http/http.dart' as http;
import 'package:sweet_cookie_jar/sweet_cookie_jar.dart';
import 'package:requests/requests.dart';

// import 'package:dio/dio.dart';
// import 'package:dio_cookie_manager/dio_cookie_manager.dart';
// import 'package:cookie_jar/cookie_jar.dart';

import 'dart:io';
import 'dart:convert';

String getCSRFFromHeader(Map header) {
  String cookies = header['set-cookie'];

  int index = cookies.indexOf(';');
  return index == -1 ? cookies : cookies.substring(10, index);
}

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
                String uri = "http://10.0.2.2:8000/";

                var r1 = await Requests.get(uri);
                r1.raiseForStatus();
                var r2 = await Requests.post(uri,
                    body: {"username": "Jiale", "password": "123321"},
                    headers: {"X-CSRFToken": getCSRFFromHeader(r1.headers)});
                r2.raiseForStatus();
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
