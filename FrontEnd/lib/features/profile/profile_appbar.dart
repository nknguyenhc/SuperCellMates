import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import "package:fluttericon/font_awesome5_icons.dart";
import 'package:get_it/get_it.dart';
import 'package:supercellmates/functions/notifications.dart';

import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/router/router.gr.dart';

class ProfileAppBar extends AppBar {
  ProfileAppBar({
    Key? key,
    required this.profileMap,
    required this.updateProfileMapCallBack,
  }) : super(key: key, toolbarHeight: 80);

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

  Notifications notifications = GetIt.I<Notifications>();

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
        onPressed: () => AutoRouter.of(context).push(EditProfileRoute(
            updateProfileImageCallBack: initProfileImage,
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
            const Padding(padding: EdgeInsets.only(top: 4)),
            SizedBox(
              height: 40,
              child: IconButton(
                onPressed: () {
                  AutoRouter.of(context)
                      .push(const FriendsRoute())
                      .then((value) {
                    notifications.countIncomingFriendRequests();
                    notifications.retrieveAcceptedRequests();
                  });
                },
                icon: ListenableBuilder(
                  listenable: GetIt.I<Notifications>(),
                  builder: (context, child) {
                    return createNotificationBadge(
                        const Icon(Icons.people),
                        notifications.incomingFriendRequestsCount +
                            notifications.outgoingAcceptedRequestCount,
                        10,
                        8);
                  },
                ),
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
        Column(
          children: [
            const Padding(padding: EdgeInsets.only(top: 11)),
            SizedBox(
              height: 34,
              child: IconButton(
                icon: const Icon(FontAwesome5.trophy),
                onPressed: () => AutoRouter.of(context).push(AchievementRoute(
                    name: widget.profileMap["user_profile"]["name"],
                    myProfile: true)),
                iconSize: 25,
              ),
            ),
            const SizedBox(
              height: 30,
              child: Text(
                " Lv.1",
                style: TextStyle(
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        const Padding(padding: EdgeInsets.only(right: 10))
      ],
    );
  }
}
