import 'dart:async';
import 'dart:math';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:easy_search_bar/easy_search_bar.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/features/home/home.dart';
import 'package:supercellmates/features/home/search.dart';
import 'package:supercellmates/router/router.gr.dart';

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

  bool showFilters = false;
  List<bool> isFilterSelected = [true, false, false, false];

  void selectFilter(int index) {
    bool prev = isFilterSelected[index];
    if (index == 0) {
      setState(() {
        isFilterSelected[0] = true;
        isFilterSelected[1] = false;
      });
    } else if (index == 1) {
      setState(() {
        isFilterSelected[0] = false;
        isFilterSelected[1] = true;
      });
    } else {
      setState(() {
        isFilterSelected[index] = !isFilterSelected[index];
      });
    }
    bool isFilterAtIndexChanged = prev != isFilterSelected[index];
    if (isFilterAtIndexChanged) {
      widget.updateCallBack(HomePage(
        key: UniqueKey(),
        sort: isFilterSelected[0]
            ? "time"
            : isFilterSelected[1]
                ? "matching_index"
                : null,
        friendFilter: isFilterSelected[2] ? "1" : "0",
        tagFilter: isFilterSelected[3] ? "1" : "0",
      ));
    }
  }

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
      searchHintText: "Search for usernames...",
      leading: IconButton(
        onPressed: () {
          AutoRouter.of(context).push(const SettingsRoute());
        },
        icon: const Icon(Icons.settings),
        iconSize: 25,
      ),
      title: const Column(
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Match Miner",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          Padding(padding: EdgeInsets.only(bottom: 4)),
        ],
      ),
      actions: [
        isAdmin
            ? IconButton(
                onPressed: () => {},
                icon: const Icon(Icons.add_card_outlined),
              )
            : Container(),
        // home feed filter
        PopupMenuButton(
          padding: const EdgeInsets.fromLTRB(4, 0, 8, 0),
          offset: Offset.fromDirection(1, 40),
          onOpened: () => setState(() {
            showFilters = true;
          }),
          onSelected: (v) => setState(() {
            showFilters = false;
          }),
          onCanceled: () => setState(() {
            showFilters = false;
          }),
          icon: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              const Text(
                "Filter",
                style: TextStyle(fontSize: 14, color: Colors.black),
              ),
              Transform.rotate(
                angle: showFilters ? pi / 2 * 3 : pi / 2,
                child: const Icon(
                  Icons.arrow_right,
                  size: 20,
                ),
              )
            ],
          ),
          itemBuilder: (context) => <PopupMenuEntry>[
            PopupMenuItem(
                height: 40,
                padding: const EdgeInsets.only(left: 10),
                onTap: () {
                  selectFilter(0);
                },
                child: Row(
                  children: [
                    const Text(
                      "Sort: time",
                      style: TextStyle(fontSize: 15),
                    ),
                    const Padding(padding: EdgeInsets.only(right: 6)),
                    isFilterSelected[0]
                        ? const Icon(
                            Icons.circle,
                            size: 8,
                          )
                        : Container()
                  ],
                )),
            PopupMenuItem(
                height: 50,
                padding: const EdgeInsets.only(left: 10),
                onTap: () {
                  showCustomDialog(context, "Coming soon",
                      "Matching index is under construction!");
                  showCustomDialog(context, "Coming soon",
                      "Matching index is under construction!");
                },
                child: Row(
                  children: [
                    const Text(
                      "Sort: matching index",
                      style: TextStyle(fontSize: 15),
                    ),
                    const Padding(padding: EdgeInsets.only(right: 6)),
                    isFilterSelected[1]
                        ? const Icon(
                            Icons.circle,
                            size: 8,
                          )
                        : Container()
                  ],
                )),
            PopupMenuItem(
                height: 50,
                padding: const EdgeInsets.only(left: 10),
                onTap: () {
                  selectFilter(2);
                },
                child: Row(
                  children: [
                    const Text(
                      "Filter: my friends",
                      style: TextStyle(fontSize: 15),
                    ),
                    const Padding(padding: EdgeInsets.only(right: 6)),
                    isFilterSelected[2]
                        ? const Icon(
                            Icons.circle,
                            size: 8,
                          )
                        : Container()
                  ],
                )),
            PopupMenuItem(
                height: 40,
                padding: const EdgeInsets.only(left: 10),
                onTap: () {
                  selectFilter(3);
                },
                child: Row(
                  children: [
                    const Text(
                      "Filter: my tags",
                      style: TextStyle(fontSize: 15),
                    ),
                    const Padding(padding: EdgeInsets.only(right: 6)),
                    isFilterSelected[3]
                        ? const Icon(
                            Icons.circle,
                            size: 8,
                          )
                        : Container()
                  ],
                )),
          ],
        )
      ],
      backgroundColor: Colors.lightBlue,
      putActionsOnRight: true,
    );
  }
}
