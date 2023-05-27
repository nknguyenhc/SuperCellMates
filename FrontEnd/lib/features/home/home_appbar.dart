import 'dart:async';
import 'dart:convert';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:easy_search_bar/easy_search_bar.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/features/home/search.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:supercellmates/http_requests/endpoints.dart';

class HomeAppBar extends AppBar {
  HomeAppBar({Key? key, required this.data, required this.updateCallBack})
      : super(key: key);

  final dynamic data;
  final dynamic updateCallBack;

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
        if (input == "") {
          widget.updateCallBack(null);
          return;
        }
        if (_searchTimer == null || !_searchTimer!.isActive) {
          _searchTimer = Timer(
            const Duration(milliseconds: 1000),
            () async => widget.updateCallBack(await searchUser(context, input)),
          );
        } else {
          _searchTimer!.cancel();
          _searchTimer = Timer(
            const Duration(milliseconds: 1000),
            () async => widget.updateCallBack(await searchUser(context, input)),
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
      title: Text("Match Miner"),
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
