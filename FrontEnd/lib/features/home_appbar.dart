import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../router/router.gr.dart';

class HomeAppBar extends AppBar {
  HomeAppBar({Key? key, required this.data}) : super(key: key);

  dynamic data;

  @override
  State<HomeAppBar> createState() => HomeAppBarState();
}

class HomeAppBarState extends State<HomeAppBar> {
  @override
  void initState() {
    super.initState();
    isAdmin = widget.data["isAdmin"];
  }
  
  bool isAdmin = false;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: IconButton(
        onPressed: () {
          AutoRouter.of(context).push(const SettingsRoute());
        },
        icon: const Icon(Icons.settings),
        iconSize: 25,
      ),
      actions: [
        isAdmin 
          ? IconButton(
            onPressed: () => {},
            icon: const Icon(Icons.add_card_outlined),
          )
          : Container(),
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
