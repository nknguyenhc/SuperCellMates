import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/features/chat/chat_appbar.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'dart:convert';

import 'package:supercellmates/features/home/home.dart';
import 'package:supercellmates/features/chat/chat.dart';
import 'package:supercellmates/features/profile/profile.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'home/home_appbar.dart';
import 'profile/profile_appbar.dart';

@RoutePage()
class MainScaffold extends StatefulWidget {
  const MainScaffold({Key? key}) : super(key: key);

  @override
  State<MainScaffold> createState() => MainScaffoldState();
}

class MainScaffoldState extends State<MainScaffold> {
  @override
  void initState() {
    dataLoaded = false;
    super.initState();
    getProfileMap();
  }

  bool dataLoaded = false;
  dynamic profileMap;

  int selectedIndex = 0;

  late List<Widget> pages;
  late List<PreferredSizeWidget> appbars;

  void getProfileMap() async {
    dynamic profileMapJson =
        await getRequest(EndPoints.profileIndex.endpoint, null);
    if (profileMapJson == "Connection error") {
      showErrorDialog(context, profileMapJson);
      return;
    }
    profileMap = jsonDecode(profileMapJson);

    appbars = <AppBar>[
      HomeAppBar(data: {
        "isAdmin": profileMap["is_admin"],
      }, updateCallBack: updateHomePageBody),
      ChatAppBar(),
      ProfileAppBar(
        profileMap: profileMap,
        updateProfileMapCallBack: getProfileMap,
      ),
    ];

    pages = [
      HomePage(key: UniqueKey()),
      ChatPage(username: profileMap["user_profile"]["username"]),
      ProfilePage(
        updateCallBack: getProfileMap,
      )
    ];

    setState(() => dataLoaded = true);
  }

  void updateHomePageBody(Widget? body) {
    setState(() {
      pages[0] = body ??
          HomePage(
            key: UniqueKey(),
          );
    });
  }

  void changeIndex(int x) {
    setState(() {
      selectedIndex = x;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!dataLoaded) {
      return WillPopScope(
          onWillPop: () async => false,
          child: Scaffold(
              appBar: AppBar(),
              body: Container(
                alignment: Alignment.center,
                child: const CircularProgressIndicator(),
              )));
    } else {
      return WillPopScope(
        onWillPop: () async => false,
        child: Scaffold(
          appBar: appbars[selectedIndex],
          body: pages[selectedIndex],
          bottomNavigationBar: BottomNavigationBar(
            items: [
              BottomNavigationBarItem(
                label: "home",
                icon: IconButton(
                  icon: const Icon(Icons.home),
                  onPressed: () => changeIndex(0),
                  iconSize: 30,
                ),
              ),
              BottomNavigationBarItem(
                label: "chat",
                icon: IconButton(
                  icon: const Icon(Icons.chat_bubble_outline_rounded),
                  onPressed: () => changeIndex(1),
                  iconSize: 30,
                ),
              ),
              BottomNavigationBarItem(
                label: "profile",
                icon: IconButton(
                  icon: const Icon(Icons.person),
                  onPressed: () => changeIndex(2),
                  iconSize: 30,
                ),
              )
            ],
            currentIndex: selectedIndex,
          ),
          resizeToAvoidBottomInset: false,
        ),
      );
    }
  }
}
