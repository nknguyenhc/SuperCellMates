import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

@RoutePage()
class AchievementPage extends StatefulWidget {
  const AchievementPage({Key? key, required this.name, required this.myProfile})
      : super(key: key);

  final String name;
  final bool myProfile;

  @override
  State<AchievementPage> createState() => AchievementPageState();
}

class AchievementPageState extends State<AchievementPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            titleSpacing: 0,
            title: Text(
              widget.myProfile
                  ? "My Achievements"
                  : "${widget.name}'s Achievements",
              style: const TextStyle(fontSize: 20),
            )),
        body: Container(
          alignment: Alignment.center,
          child: const Text(
            "Achievement page is under construction!",
          ),
        ));
  }
}
