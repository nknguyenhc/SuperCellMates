import 'dart:typed_data';
import 'dart:io';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/features/posts/post_listview.dart';
import 'package:supercellmates/functions/notifications.dart';
import 'package:supercellmates/functions/tutorial.dart';
import 'dart:convert';

import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:tutorial_coach_mark/tutorial_coach_mark.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key, required this.updateCallBack}) : super(key: key);

  final dynamic updateCallBack;

  @override
  State<ProfilePage> createState() => ProfilePageState();
}

class ProfilePageState extends State<ProfilePage> {
  dynamic data;
  int tagListCount = 0;
  int selectedTagIndex = -1;
  var dataLoaded = [];
  var tagIcons = [];
  dynamic profilePosts;
  bool profilePostsLoaded = false;

  Notifications notifications = GetIt.I<Notifications>();

  GlobalKey target1Key = GlobalKey();
  GlobalKey target2Key = GlobalKey();

  @override
  void initState() {
    super.initState();
    loadData();
  }

  void showProfilePageTutorial() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    if (prefs.getBool("profilePageTutorialCompleted") != true) {
      TargetFocus target1 =
          TargetFocus(identify: "1", keyTarget: target1Key, contents: [
        buildTutorialContent(
            "Add tags to your profile",
            "Profile page is where you can manage your tags, posts and friends.\n"
                "Users can view others' profile page to know each other better!\n\n"
                "In out platform, everything works around tags.\n"
                "Press the add button to claim tags that represent your interest.")
      ]);

      TargetFocus target2 =
          TargetFocus(identify: "2", keyTarget: target2Key, contents: [
        buildTutorialContent(
            "Start posting",
            "After claiming some tags, you'll be able to start posting about them!\n"
                "Each post must be associated with one and only one tag.\n\n"
                "You can also edit and delete your posts after creating them.")
      ]);

      List<TargetFocus> targets = [target1, target2];
      TutorialCoachMark tutorial = TutorialCoachMark(targets: targets);
      tutorial.show(context: context);
      prefs.setBool("profilePageTutorialCompleted", true);
    }
  }

  void loadData() async {
    dynamic dataJson = await getRequest(EndPoints.profileIndex.endpoint, null);
    if (dataJson == "Connection error") {
      showErrorDialog(context, dataJson);
      return;
    }
    data = jsonDecode(dataJson);
    tagListCount = data["tags"].length;
    dataLoaded = List<bool>.filled(tagListCount, false, growable: true);
    tagIcons = List<Uint8List>.filled(tagListCount, Uint8List.fromList([]),
        growable: true);
    for (int i = 0; i < tagListCount; i++) {
      loadTagIcons(i);
    }
    setState(() => data = data);
    showProfilePageTutorial();
    loadProfilePosts();
  }

  void loadProfilePosts() async {
    profilePostsLoaded = false;
    Map<String, dynamic> requestBody = {
      "start": DateTime(2023).microsecondsSinceEpoch.toDouble() / 1000000,
      "end": DateTime(2099).microsecondsSinceEpoch.toDouble() / 1000000,
    };
    if (selectedTagIndex != -1) {
      requestBody["tag"] = data["tags"][selectedTagIndex]["name"];
    }

    dynamic profilePostsResponseJson = await getRequest(
        EndPoints.getProfilePosts.endpoint + data["user_profile"]["username"],
        requestBody);
    if (profilePostsResponseJson == "Connection error") {
      showErrorDialog(context, profilePostsResponseJson);
      return;
    }
    dynamic profilePostsResponse = jsonDecode(profilePostsResponseJson);
    assert(profilePostsResponse["myProfile"]);
    profilePosts = profilePostsResponse["posts"];

    notifications.update();

    setState(() => profilePostsLoaded = true);
  }

  void loadTagIcons(index) async {
    tagIcons[index] = await getRawImageData(data["tags"][index]["icon"]);
    setState(() {
      dataLoaded[index] = true;
    });
  }

  void chooseTag(index) {
    setState(() {
      selectedTagIndex = selectedTagIndex == index ? -1 : index;
    });
    loadProfilePosts();
  }

  @override
  Widget build(BuildContext context) {
    var tagList = data != null ? data["tags"] : null;
    // app bar: 72, taglist: 50, divider: 4, selected tag info: 45,
    // bottom navigation bar: ?
    double myPostsHeight = MediaQuery.of(context).size.height - 251;
    if (Platform.isIOS) {
      myPostsHeight -= 57;
    }

    Widget buildTagList() {
      return ListView.builder(
          padding: const EdgeInsets.only(left: 6, right: 12),
          shrinkWrap: true,
          itemCount: tagList.length + 1,
          scrollDirection: Axis.horizontal,
          itemBuilder: (BuildContext context, int index) {
            Widget buildTagIcon() {
              return Container(
                width: selectedTagIndex == index ? 43 : 40,
                height: selectedTagIndex == index ? 43 : 40,
                decoration: BoxDecoration(
                    border: Border.all(
                        color: selectedTagIndex == index
                            ? Colors.pink
                            : Colors.black54,
                        width: selectedTagIndex == index ? 4 : 2.5),
                    shape: BoxShape.circle),
                child: IconButton(
                    onPressed: () => {chooseTag(index)},
                    icon: dataLoaded[index]
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(25),
                            child: Image.memory(tagIcons[index],
                                width: 40, height: 40, fit: BoxFit.contain),
                          )
                        : const CircularProgressIndicator(),
                    padding: EdgeInsets.zero),
              );
            }

            Widget buildAddTagIcon() {
              return IconButton(
                key: target1Key,
                onPressed: () => AutoRouter.of(context)
                    .push(AddTagRoute(updateCallBack: loadData)),
                icon: const Icon(Icons.add_circle_outline_rounded),
                iconSize: 47,
                padding: const EdgeInsets.only(left: 3),
              );
            }

            return index < tagList.length
                ? tagList[index] == ""
                    ? Container()
                    : Row(
                        children: [
                          const Padding(padding: EdgeInsets.only(left: 6)),
                          buildTagIcon(),
                        ],
                      )
                : buildAddTagIcon();
          });
    }

    Widget buildSelectedTagInfo() {
      return Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          const Text(
            "My posts about",
            style: TextStyle(fontSize: 14),
          ),
          Text(
            selectedTagIndex == -1
                ? "any tag"
                : "\"${tagList[selectedTagIndex]["name"]}\"",
            style: const TextStyle(
                fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black),
          )
        ],
      );
    }

    Widget buildCreatePostButton() {
      return TextButton(
        key: target2Key,
        style: const ButtonStyle(
            padding: MaterialStatePropertyAll(EdgeInsets.only(left: 5))),
        onPressed: () {
          if (selectedTagIndex == -1) {
            showCustomDialog(context, "Hold on",
                "Press the tag icons above, to select one you want to post about!");
            return;
          }
          AutoRouter.of(context).push(CreatePostRoute(
              tagName: data["tags"][selectedTagIndex]["name"],
              updateCallBack: loadProfilePosts,
              isEdit: false));
        },
        child: const Row(children: [
          Icon(Icons.post_add, size: 40),
          Text(
            "New post",
          )
        ]),
      );
    }

    Widget dividerWithShadow = Container(
      height: 4,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.grey,
            Colors.white,
          ],
        ),
      ),
    );

    return data != null
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Tags
              SizedBox(
                height: 50,
                child: Flex(direction: Axis.horizontal, children: [
                  Expanded(
                    child: buildTagList(),
                  )
                ]),
              ),

              // selected tag info, create post button
              SizedBox(
                height: 45,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    buildSelectedTagInfo(),
                    const Padding(padding: EdgeInsets.only(left: 10)),
                    buildCreatePostButton(),
                  ],
                ),
              ),

              dividerWithShadow,

              // posts
              data["tags"].length == 0
                  ? SizedBox(
                      height: myPostsHeight,
                      width: MediaQuery.of(context).size.width - 20,
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "You have no tags yet.\n\nPress the add button above to claim tags\nand start creating posts!",
                            textAlign: TextAlign.center,
                          ),
                          Padding(padding: EdgeInsets.only(bottom: 80)),
                        ],
                      ))
                  : SizedBox(
                      height: myPostsHeight,
                      width: MediaQuery.of(context).size.width,
                      child: profilePostsLoaded
                          ? PostListView(
                              postList: profilePosts,
                              isInSomeProfile: true,
                              username: data["user_profile"]["username"],
                              updateCallBack: loadProfilePosts,
                              refreshable: false,
                              scrollAtTopEvent: () {},
                              scrollAtBottomEvent: () {},
                            )
                          : Container(
                              alignment: Alignment.center,
                              child: const CircularProgressIndicator(),
                            )),
            ],
          )
        : Container(
            alignment: Alignment.center,
            child: const CircularProgressIndicator(),
          );
  }
}
