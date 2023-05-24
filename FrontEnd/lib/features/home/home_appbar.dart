import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:easy_search_bar/easy_search_bar.dart';

import 'package:supercellmates/router/router.gr.dart';

class HomeAppBar extends AppBar {
  HomeAppBar({Key? key, required this.data}) : super(key: key);

  final dynamic data;

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

  Timer? _searchTimer;

  @override
  Widget build(BuildContext context) {
    return EasySearchBar(
      onSearch: (input) {
        if (_searchTimer == null || !_searchTimer!.isActive) {
          _searchTimer = Timer(
            const Duration(milliseconds: 1000),
            () {
              // search
              print("search!");
            },
          );
        } else {
          _searchTimer!.cancel();
          _searchTimer = Timer(
            const Duration(milliseconds: 1000),
            () {
              // search
              print("search!");
            },
          );
        }
      },
      searchHintText: "Names, Usernames, Posts...",
      leading: IconButton(
        onPressed: () {
          AutoRouter.of(context).push(const SettingsRoute());
        },
        icon: const Icon(Icons.settings),
        iconSize: 25,
      ),
      title: Text("Let's Orbitate!"),
      actions: [
        isAdmin
            ? IconButton(
                onPressed: () => {},
                icon: const Icon(Icons.add_card_outlined),
              )
            : Container(),
      ],
      backgroundColor: Colors.lightBlue,
      putActionsOnRight: true,
    );
  }
}
