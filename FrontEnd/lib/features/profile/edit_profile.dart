import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

import 'change_profile_image.dart';

@RoutePage()
class EditProfilePage extends StatefulWidget {
  const EditProfilePage({Key? key, required this.callBack}) : super(key: key);

  final dynamic callBack;

  @override
  State<EditProfilePage> createState() => EditProfilePageState();
}

class EditProfilePageState extends State<EditProfilePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("EditProfile page header")),
        body: Column(
          children: [
            ChangeProfileImageButton(callBack: widget.callBack),
          ],
        ));
  }
}
