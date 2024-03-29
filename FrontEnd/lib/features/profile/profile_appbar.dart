import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
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
  }) : super(key: key, toolbarHeight: 72);

  final dynamic profileMap;
  final dynamic updateProfileMapCallBack;

  @override
  State<ProfileAppBar> createState() => ProfileAppBarState();
}

class ProfileAppBarState extends State<ProfileAppBar> {
  @override
  void initState() {
    super.initState();
    initProfileImage();
  }

  String displayName = "";
  String username = "";
  Image? profileImage;

  Notifications notifications = GetIt.I<Notifications>();

  void initProfileImage() {
    DefaultCacheManager()
        .getFileFromCache(widget.profileMap["image_url"])
        .then((cachedImage) async {
      if (cachedImage != null) {
        setState(() => profileImage = Image.file(cachedImage.file));
      }
    }).then((value) {
      getImage(widget.profileMap["image_url"], true).then((currentImage) {
        setState(() => profileImage = currentImage);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    Widget buildProfileImage() {
      return IconButton(
        padding: const EdgeInsets.only(left: 12),
        icon: profileImage ?? const CircularProgressIndicator(),
        onPressed: () => AutoRouter.of(context).push(EditProfileRoute(
            updateProfileImageCallBack: initProfileImage,
            updateProfileMapCallBack: widget.updateProfileMapCallBack)),
        iconSize: 50,
      );
    }

    Widget buildNameSection() {
      return Column(children: [
        SizedBox(
          height: 22,
          width: 300,
          child: Text(
            widget.profileMap["user_profile"]["name"],
            strutStyle: StrutStyle(forceStrutHeight: false),
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: Color.fromARGB(221, 44, 44, 44)),
          ),
        ),
        SizedBox(
          height: 22,
          width: 300,
          child: Text(
            "@${widget.profileMap["user_profile"]["username"]}",
            style: const TextStyle(fontSize: 15, color: Colors.black45),
          ),
        ),
      ]);
    }

    Widget buildFriendsButton() {
      return SizedBox(
        height: 39,
        child: IconButton(
          padding: const EdgeInsets.only(top: 9),
          onPressed: () {
            AutoRouter.of(context).push(const FriendsRoute()).then((value) {
              notifications.update();
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
      );
    }

    Widget buildAchievementsButton() {
      return SizedBox(
        height: 40,
        child: IconButton(
          padding: EdgeInsets.only(top: 14),
          icon: const Icon(FontAwesome5.trophy),
          onPressed: () => AutoRouter.of(context).push(AchievementRoute(
              name: widget.profileMap["user_profile"]["name"],
              myProfile: true)),
          iconSize: 25,
        ),
      );
    }

    return AppBar(
      titleSpacing: 10,
      toolbarHeight: 72,
      backgroundColor: Colors.lightBlue,
      leading: buildProfileImage(),
      title: buildNameSection(),
      actions: [
        Column(
          children: [
            //const Padding(padding: EdgeInsets.only(top: 4)),
            buildFriendsButton(),
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
            //const Padding(padding: EdgeInsets.only(top: 11)),
            buildAchievementsButton(),
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
