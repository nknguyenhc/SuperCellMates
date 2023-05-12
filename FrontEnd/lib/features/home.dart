import 'package:flutter/material.dart';
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
                HttpClient client = HttpClient();
                HttpClientRequest request = await client.get('127.0.0.1', 8000, '/');
                HttpClientResponse response = await request.close();
                final stringData = await response.transform(utf8.decoder).join();
                print(stringData);
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
