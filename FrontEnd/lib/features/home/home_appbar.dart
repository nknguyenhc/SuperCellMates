import 'dart:async';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:easy_search_bar/easy_search_bar.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supercellmates/features/home/home.dart';
import 'package:supercellmates/features/home/search.dart';
import 'package:supercellmates/functions/tutorial.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:tutorial_coach_mark/tutorial_coach_mark.dart';

class HomeAppBar extends AppBar {
  HomeAppBar({
    Key? key,
    required this.data,
    required this.updateCallBack,
    required this.isFilterSelected,
    required this.onDispose,
  }) : super(key: key);

  final dynamic data;
  final dynamic updateCallBack;
  final List<bool> isFilterSelected;
  final dynamic onDispose;

  @override
  State<HomeAppBar> createState() => HomeAppBarState();
}

class HomeAppBarState extends State<HomeAppBar> {
  @override
  void initState() {
    super.initState();
    isAdmin = widget.data["isAdmin"];
    showHomePageTutorial();
  }

  @override
  void dispose() {
    super.dispose();
    widget.onDispose(widget.isFilterSelected);
  }

  bool isAdmin = false;

  Timer? _searchTimer;

  void selectFilter(int index) {
    bool prev = widget.isFilterSelected[index];
    if (index == 0) {
      setState(() {
        widget.isFilterSelected[0] = true;
        widget.isFilterSelected[1] = false;
      });
    } else if (index == 1) {
      setState(() {
        widget.isFilterSelected[0] = false;
        widget.isFilterSelected[1] = true;
      });
    } else {
      setState(() {
        widget.isFilterSelected[index] = !widget.isFilterSelected[index];
      });
    }
    bool isFilterAtIndexChanged = prev != widget.isFilterSelected[index];
    if (isFilterAtIndexChanged) {
      widget.updateCallBack(HomePage(
        key: UniqueKey(),
        username: widget.data["username"],
        sort: widget.isFilterSelected[0]
            ? "time"
            : widget.isFilterSelected[1]
                ? "recommendation"
                : null,
        friendFilter: widget.isFilterSelected[2] ? "1" : "0",
        tagFilter: widget.isFilterSelected[3] ? "1" : "0",
      ));
    }
  }

  List topTabTexts = ["New", "Recommended"];

  Widget topTab(int index) {
    return Tab(
      key: index == 0 ? target1Key : GlobalKey(),
      text: topTabTexts[index],
    );
  }

  GlobalKey target1Key = GlobalKey();
  GlobalKey target2Key = GlobalKey();

  void showHomePageTutorial() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    if (prefs.getBool("homePageTutorialCompleted") != true) {
      TargetFocus target1 =
          TargetFocus(identify: "1", keyTarget: target1Key, contents: [
        buildTutorialContent(
            "Welcome to Match Miner",
            "Have you ever felt anxious posting about yourself on social media?\n"
                "This platform aims to help you share about your interests freely, and find others with similar interests.\n\n"
                "In the home page, you can view other users' posts about their interests.\n"
                "Press the tabs to change how the posts are sorted.")
      ]);

      TargetFocus target2 =
          TargetFocus(identify: "2", keyTarget: target2Key, contents: [
        buildTutorialContent(
            "Filter and search",
            "You can customise your home feed further using the filter button.\n\n"
                "Use the search button to find a specific user.\n"
                "You can view other users' profile page by pressing their profile image"),
      ]);
      TutorialCoachMark tutorial =
          TutorialCoachMark(targets: [target1, target2]);
      tutorial.show(context: context);
      prefs.setBool("homePageTutorialCompleted", true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
        length: topTabTexts.length,
        initialIndex: widget.isFilterSelected[0] ? 0 : 1,
        child: Builder(
          builder: (context) {
            Widget settingsIconButton = IconButton(
              onPressed: () {
                AutoRouter.of(context).push(const SettingsRoute());
              },
              icon: const Icon(Icons.settings),
              iconSize: 25,
            );

            TabController tabController = DefaultTabController.of(context);
            tabController.addListener(() {
              if (tabController.indexIsChanging) {
                selectFilter(tabController.index);
              }
            });

            Widget topTabBar = TabBar(
                padding: const EdgeInsets.only(top: 7),
                indicatorColor: Colors.transparent,
                dividerColor: Colors.transparent,
                indicator: const BoxDecoration(),
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white60,
                labelPadding: const EdgeInsets.only(right: 20),
                labelStyle:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                unselectedLabelStyle:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                isScrollable: true,
                controller: tabController,
                onTap: (index) {
                  selectFilter(index);
                },
                tabs: [topTab(0), topTab(1)]);

            PopupMenuEntry friendFilterPopupMenuItem = PopupMenuItem(
                padding: EdgeInsets.zero,
                height: 40,
                onTap: () {
                  selectFilter(2);
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      "My friends",
                    ),
                    widget.isFilterSelected[2]
                        ? const Row(
                            children: [
                              Padding(padding: EdgeInsets.only(right: 6)),
                              Icon(
                                Icons.circle,
                                size: 8,
                              )
                            ],
                          )
                        : Container()
                  ],
                ));

            PopupMenuEntry tagFilterPopupMenuItem = PopupMenuItem(
                padding: EdgeInsets.zero,
                height: 40,
                onTap: () {
                  selectFilter(3);
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      "My tags",
                    ),
                    widget.isFilterSelected[3]
                        ? const Row(
                            children: [
                              Padding(padding: EdgeInsets.only(right: 6)),
                              Icon(
                                Icons.circle,
                                size: 8,
                              )
                            ],
                          )
                        : Container()
                  ],
                ));

            Widget filterPopupMenuButton = PopupMenuButton(
              key: target2Key,
              padding: const EdgeInsets.fromLTRB(4, 3.5, 5, 0),
              position: PopupMenuPosition.under,
              offset: const Offset(33, 5),
              icon: const Icon(
                Icons.filter_alt,
                color: Color.fromARGB(255, 65, 65, 65),
              ),
              tooltip: "Filter",
              itemBuilder: (context) => <PopupMenuEntry>[
                friendFilterPopupMenuItem,
                tagFilterPopupMenuItem,
              ],
            );

            return EasySearchBar(
              onSearch: (input) {
                if (input == "") {
                  widget.updateCallBack(null);
                  return;
                }
                if (_searchTimer == null || !_searchTimer!.isActive) {
                  _searchTimer = Timer(
                    const Duration(milliseconds: 1000),
                    () async =>
                        widget.updateCallBack(await searchUser(context, input)),
                  );
                } else {
                  _searchTimer!.cancel();
                  _searchTimer = Timer(
                    const Duration(milliseconds: 1000),
                    () async =>
                        widget.updateCallBack(await searchUser(context, input)),
                  );
                }
              },
              searchHintText: "Search by name, @username...",
              leading: settingsIconButton,
              title: topTabBar,
              actions: [
                isAdmin
                    ? IconButton(
                        onPressed: () => {},
                        icon: const Icon(Icons.add_card_outlined),
                      )
                    : Container(),
                // home feed filter
                filterPopupMenuButton,
              ],
              backgroundColor: Colors.lightBlue,
              putActionsOnRight: false,
            );
          },
        ));
  }
}
