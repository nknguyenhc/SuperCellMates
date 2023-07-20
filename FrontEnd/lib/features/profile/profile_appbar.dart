import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/router/router.gr.dart';

class ProfileAppBar extends AppBar {
  ProfileAppBar(
      {Key? key,
      required this.profileMap,
      required this.updateProfileMapCallBack})
      : super(key: key, toolbarHeight: 80);

  final dynamic profileMap;
  final dynamic updateProfileMapCallBack;

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
    dataLoaded = false;
    profileImage = await getImage(widget.profileMap["image_url"]);
    setState(() {
      dataLoaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppBar(
      titleSpacing: 10,
      toolbarHeight: 80,
      backgroundColor: Colors.lightBlue,
      leading: IconButton(
        padding: const EdgeInsets.only(left: 12),
        icon: dataLoaded ? profileImage! : const CircularProgressIndicator(),
        onPressed: () => AutoRouter.of(context)
            .push(EditProfileRoute(updateProfileImageCallBack: initProfileImage,
            updateProfileMapCallBack: widget.updateProfileMapCallBack)),
        iconSize: 50,
      ),
      title: Column(children: [
        SizedBox(
          height: 24,
          width: 300,
          child: Text(
            widget.profileMap["user_profile"]["name"],
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
        ),
        SizedBox(
          height: 22,
          width: 300,
          child: Text(
            "@${widget.profileMap["user_profile"]["username"]}",
            style: const TextStyle(fontSize: 15, color: Colors.blueGrey),
          ),
        ),
      ]),
      actions: [
        Column(
          children: [
            const Padding(padding: EdgeInsets.only(top:4)),
            SizedBox(
              height: 40,
              child: IconButton(
                onPressed: () {
                  AutoRouter.of(context).push(const FriendsRoute());
                },
                icon: const Icon(Icons.people),
                iconSize: 38,
              ),
            ),
            const SizedBox(
              height: 30,
              child: Text(
                "Friends",
                style: TextStyle(
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
        const Padding(padding: EdgeInsets.only(right: 2)),
        Column(
          children: [
            const Padding(padding: EdgeInsets.only(top:4)),
            SizedBox(
              height: 40,
              child: IconButton(
                icon: const Icon(Icons.pentagon),
                onPressed: () => AutoRouter.of(context).push(AchievementRoute(
                    name: widget.profileMap["user_profile"]["name"],
                    myProfile: true)),
                iconSize: 35,
              ),
            ),
            const SizedBox(
              height: 30,
              child: Text(
                "Lv.1",
                style: TextStyle(
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
        const Padding(padding: EdgeInsets.only(right: 5))
      ],
    );
  }
}
