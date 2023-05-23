import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

import '../auth/logout.dart';

@RoutePage()
class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  State<SettingsPage> createState() => SettingsPageState();
}

class SettingsPageState extends State<SettingsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("Settings page header")),
        body: Column(
          children: [
            LogOutButton(),
          ],
        ));
  }
}
