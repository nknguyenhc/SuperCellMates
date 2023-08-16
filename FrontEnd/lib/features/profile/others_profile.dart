import 'dart:convert';
import 'dart:typed_data';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import "package:fluttericon/font_awesome5_icons.dart";
import 'package:supercellmates/features/posts/post_listview.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/functions/matching_index.dart';

@RoutePage()
class OthersProfilePage extends StatefulWidget {
  const OthersProfilePage(
      {Key? key, required this.username, this.onDeleteFriendCallBack})
      : super(key: key);

  final String username;
  final dynamic onDeleteFriendCallBack;

  @override
  State<OthersProfilePage> createState() => OthersProfilePageState();
}

class OthersProfilePageState extends State<OthersProfilePage> {
  dynamic profileData;
  bool profileDataLoaded = false;
  bool profileImageLoaded = false;
  Uint8List profileImage = Uint8List.fromList([]);
  bool profilePostsLoaded = false;
  dynamic profilePosts;

  int tagListCount = 0;
  var dataLoaded = [];
  var tagIcons = [];
  int selectedTagIndex = -1;

  @override
  void initState() {
    super.initState();
    getProfileInfo();
  }

  void getProfileInfo() {
    getRequest("${EndPoints.viewProfile.endpoint}/${widget.username}", null)
        .then((value) {
      if (value == "Connection error") {
        showErrorDialog(context, value);
        return;
      }
      profileData = jsonDecode(value);
      setState(() {
        profileDataLoaded = true;
      });
    }).then((value) {
      loadData();
    });
  }

  void loadData() async {
    // profile image
    initProfileImage();
    // tags
    tagListCount = profileData["tags"].length;
    dataLoaded = List<bool>.filled(tagListCount, false, growable: true);
    tagIcons = List<Uint8List>.filled(tagListCount, Uint8List.fromList([]),
        growable: true);
    for (int i = 0; i < tagListCount; i++) {
      loadTagIcons(i);
    }
    loadProfilePosts();
  }

  void loadProfilePosts() async {
    profilePostsLoaded = false;
    Map<String, dynamic> requestBody = {
      "start": DateTime(2023).microsecondsSinceEpoch.toDouble() / 1000000,
      "end": DateTime(2099).microsecondsSinceEpoch.toDouble() / 1000000,
    };
    if (selectedTagIndex != -1) {
      requestBody["tag"] = profileData["tags"][selectedTagIndex]["name"];
    }

    dynamic profilePostsResponseJson = await getRequest(
        EndPoints.getProfilePosts.endpoint +
            profileData["user_profile"]["username"],
        requestBody);
    if (profilePostsResponseJson == "Connection error") {
      showErrorDialog(context, profilePostsResponseJson);
      return;
    }
    dynamic profilePostsResponse = jsonDecode(profilePostsResponseJson);
    assert(!profilePostsResponse["myProfile"]);
    profilePosts = profilePostsResponse["posts"];
    setState(() => profilePostsLoaded = true);
  }

  void loadTagIcons(index) async {
    tagIcons[index] = await getRawImageData(profileData["tags"][index]["icon"], false);
    setState(() {
      dataLoaded[index] = true;
    });
  }

  void initProfileImage() async {
    profileImageLoaded = false;
    profileImage = await getRawImageData(profileData["image_url"], true);
    setState(() {
      profileImageLoaded = true;
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
    if (!profileDataLoaded) {
      return Scaffold(
          appBar: AppBar(),
          body: Container(
            alignment: Alignment.center,
            child: const CircularProgressIndicator(),
          ));
    }
    var tagList = profileData["tags"];
    double myPostsHeight = MediaQuery.of(context).size.height - 173;

    void sendFriendRequest() async {
      startUploadingDialog(context, "data");
      dynamic body = {"username": profileData["user_profile"]["username"]};
      dynamic message =
          await postWithCSRF(EndPoints.addFriendRequest.endpoint, body);
      stopLoadingDialog(context);
      Future.delayed(Duration(milliseconds: 100)).then((value) {
        if (message == "ok") {
          showSuccessDialog(context, "Friend request sent!");
        } else {
          showErrorDialog(context, message);
        }
      });
    }

    void deleteFriend() async {
      startUploadingDialog(context, "data");
      dynamic body = {"username": profileData["user_profile"]["username"]};
      dynamic message =
          await postWithCSRF(EndPoints.deleteFriend.endpoint, body);
      stopLoadingDialog(context);
      Future.delayed(Duration(milliseconds: 100)).then((value) {
        if (message == "friend deleted") {
          if (widget.onDeleteFriendCallBack != null) {
            widget.onDeleteFriendCallBack();
          }
          AutoRouter.of(context).pop().then((value) =>
              showSuccessDialog(context, "Successfully removed friend!"));
        } else {
          showErrorDialog(context, message);
        }
      });
    }

    Widget buildProfileImage() {
      return SizedBox(
        height: 45,
        width: 45,
        child: IconButton(
          padding: EdgeInsets.zero,
          icon: profileImageLoaded
              ? Image.memory(profileImage)
              : const CircularProgressIndicator(),
          onPressed: () {
            AutoRouter.of(context)
                .push(SinglePhotoViewer(photoBytes: profileImage, actions: []));
          },
          iconSize: 45,
        ),
      );
    }

    Widget buildNameSection() {
      return Column(children: [
        SizedBox(
          height: 22,
          width: MediaQuery.of(context).size.width - 225,
          child: Text(
            profileData["user_profile"]["name"],
            style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 18,
                color: Color.fromARGB(221, 44, 44, 44)),
          ),
        ),
        SizedBox(
          height: 22,
          width: MediaQuery.of(context).size.width - 225,
          child: Text(
            "@${profileData["user_profile"]["username"]}",
            style: const TextStyle(fontSize: 15, color: Colors.black45),
          ),
        ),
      ]);
    }

    Widget buildAddFriendSection() {
      return Column(
        children: [
          SizedBox(
            height: 39,
            child: IconButton(
              icon: const Icon(Icons.person_add),
              onPressed: () {
                showConfirmationDialog(
                    context,
                    "Are you sure to send a friend request?",
                    sendFriendRequest);
              },
              iconSize: 36,
              padding: const EdgeInsets.only(top: 8),
            ),
          ),
          const SizedBox(
            height: 30,
            child: Text(
              " Add",
              style: TextStyle(
                fontSize: 13,
              ),
            ),
          ),
        ],
      );
    }

    Widget buildDeleteFriendSection() {
      return Column(
        children: [
          SizedBox(
            height: 39,
            child: IconButton(
              icon: const Icon(Icons.person_remove),
              onPressed: () {
                showConfirmationDialog(
                    context,
                    "Are you sure to unfriend ${profileData["user_profile"]["name"]}?",
                    deleteFriend);
              },
              iconSize: 36,
              padding: const EdgeInsets.only(top: 8.2),
            ),
          ),
          const SizedBox(
            height: 30,
            child: Text(
              "Unfriend",
              style: TextStyle(
                fontSize: 13,
              ),
            ),
          ),
        ],
      );
    }

    Widget buildAchievementsSection() {
      return Column(
        children: [
          SizedBox(
            height: 39,
            child: IconButton(
              icon: const Icon(FontAwesome5.trophy),
              onPressed: () => AutoRouter.of(context).push(AchievementRoute(
                  name: profileData["user_profile"]["name"], myProfile: false)),
              iconSize: 25,
              padding: const EdgeInsets.only(top: 13),
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
      );
    }

    Widget buildMatchingIndexSection() {
      return SizedBox(
        width: 50,
        height: 30,
        child: buildMatchingIndexButton(
            context, profileData["matching_index"].round()),
      );
    }

    Widget buildTagList() {
      return ListView.builder(
          padding: const EdgeInsets.only(left: 6, right: 12),
          shrinkWrap: true,
          itemCount: tagList.length,
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

            return tagList[index] == ""
                ? Container()
                : Row(
                    children: [
                      const Padding(padding: EdgeInsets.only(left: 6)),
                      buildTagIcon(),
                    ],
                  );
          });
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

    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        leadingWidth: 50,
        toolbarHeight: 70,
        backgroundColor: Colors.lightBlue,
        titleSpacing: 0,
        title: Row(
          children: [
            buildProfileImage(),
            const Padding(padding: EdgeInsets.all(5)),
            buildNameSection(),
          ],
        ),
        actions: [
          profileData["is_friend"]
              ? buildDeleteFriendSection()
              : buildAddFriendSection(),
          buildAchievementsSection(),
          const Padding(padding: EdgeInsets.only(right: 10)),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Tags
          SizedBox(
            height: 50,
            child: Flex(
                crossAxisAlignment: CrossAxisAlignment.center,
                direction: Axis.horizontal,
                children: [
                  const Padding(padding: EdgeInsets.only(left: 20)),
                  buildMatchingIndexSection(),
                  Expanded(
                    child: buildTagList(),
                  )
                ]),
          ),
          dividerWithShadow,
          SizedBox(
              height: myPostsHeight,
              width: MediaQuery.of(context).size.width,
              child: profilePostsLoaded
                  ? PostListView(
                      key: UniqueKey(),
                      postList: profilePosts,
                      username: "", // treates as not original poster
                      isInSomeProfile: true,
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
      ),
    );
  }
}
