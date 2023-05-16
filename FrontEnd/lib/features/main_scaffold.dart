import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

import '../features/home.dart';
import '../features/chat.dart';
import '../features/profile.dart';

@RoutePage()
class MainScaffold extends StatefulWidget {
  const MainScaffold({Key? key}) : super(key: key);

  @override
  State<MainScaffold> createState() => MainScaffoldState();
}

class MainScaffoldState extends State<MainScaffold> {
  int selectedIndex = 0;

  final pages = <Widget>[
    const HomePage(),
    const ChatPage(),
    const ProfilePage()
  ];

  void changeIndex(int x) {
    setState(() {
      selectedIndex = x;
    });
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false,
      child: Scaffold(
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
      ),
    );
  }
}
