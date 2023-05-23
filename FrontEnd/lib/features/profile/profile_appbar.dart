import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';

import 'package:supercellmates/config/config.dart';
import 'package:supercellmates/router/router.gr.dart';

class ProfileAppBar extends AppBar {
  ProfileAppBar({Key? key, required this.profileMap})
      : super(key: key, toolbarHeight: 80);

  final dynamic profileMap;

  @override
  State<ProfileAppBar> createState() => ProfileAppBarState();
}

class ProfileAppBarState extends State<ProfileAppBar> {
  @override
  void initState() {
    dataLoaded = false;
    super.initState();
    initProfileImage();
  }

  bool dataLoaded = false;

  String displayName = "";
  String username = "";
  Image? profileImage;

  void initProfileImage() async {
    print("Initializing Profile Image");
    dataLoaded = false;
    String profileImageURL =
        GetIt.I<Config>().restBaseURL + widget.profileMap["image_url"];

    var response = await Requests.get(profileImageURL);
    setState(() {
      profileImage = Image.memory(response.bodyBytes);
      dataLoaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppBar(
      toolbarHeight: 80,
      backgroundColor: Colors.yellow,
      leading: IconButton(
        icon: dataLoaded ? profileImage! : const CircularProgressIndicator(),
        onPressed: () => AutoRouter.of(context)
            .push(EditProfileRoute(callBack: initProfileImage)),
        iconSize: 50,
      ),
      title: Column(children: [
        SizedBox(
          height: 25,
          width: 300,
          child: Text(
            widget.profileMap["name"],
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.only(left: 1),
          height: 20,
          width: 300,
          child: Text(
            widget.profileMap["username"],
            style: const TextStyle(fontSize: 15, color: Colors.blueGrey),
          ),
        ),
      ]),
      actions: [
        Column(
          children: [
            SizedBox(
              height: 45,
              child: IconButton(
                icon: const Icon(Icons.pentagon),
                onPressed: () =>
                    AutoRouter.of(context).push(const AchievementRoute()),
                iconSize: 40,
              ),
            ),
            const SizedBox(
              height: 30,
              child: Text(
                "Lv ?",
                style: TextStyle(
                  fontSize: 15,
                ),
              ),
            ),
          ],
        ),
        Container(padding: const EdgeInsets.all(10)),
      ],
    );
  }
}
