import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../router/router.gr.dart';

class HomeAppBar extends AppBar {
  HomeAppBar({Key? key}) : super(key: key);

  @override
  State<HomeAppBar> createState() => HomeAppBarState();
}

class HomeAppBarState extends State<HomeAppBar> {
  @override
  Widget build(BuildContext context) {
    return AppBar(
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
    );
  }
}
