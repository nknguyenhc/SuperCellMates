import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

import '../router/router.gr.dart';

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
              onPressed: () {
                AutoRouter.of(context).push(const FriendRequestRoute());
              },
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
