import 'dart:convert';
import 'dart:typed_data';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:supercellmates/features/posts/post_listview.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:supercellmates/features/dialogs.dart';

@RoutePage()
class OthersProfilePage extends StatefulWidget {
  const OthersProfilePage(
      {Key? key, required this.data, this.onDeleteFriendCallBack})
      : super(key: key);

  final dynamic data;
  final dynamic onDeleteFriendCallBack;

  @override
  State<OthersProfilePage> createState() => OthersProfilePageState();
}

class OthersProfilePageState extends State<OthersProfilePage> {
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
    loadData();
  }

  void loadData() async {
    // profile image
    initProfileImage();
    // tags
    tagListCount = widget.data["tags"].length;
    dataLoaded = List<bool>.filled(tagListCount, false, growable: true);
    tagIcons = List<Uint8List>.filled(tagListCount, Uint8List.fromList([]),
        growable: true);
    for (int i = 0; i < tagListCount; i++) {
      loadTagIcons(i);
    }
    // posts
    profilePostsLoaded = false;
    dynamic profilePostsResponse = jsonDecode(await getRequest(
        EndPoints.getProfilePosts.endpoint +
            widget.data["user_profile"]["username"],
        {"start": "2023-06-17-00-00-00", "end": "2023-06-25-00-00-00"}));
    assert(!profilePostsResponse["myProfile"]);
    profilePosts = profilePostsResponse["posts"];
    setState(() => profilePostsLoaded = true);
  }

  void loadTagIcons(index) async {
    tagIcons[index] = await getRawImageData(widget.data["tags"][index]["icon"]);
    setState(() {
      dataLoaded[index] = true;
    });
  }

  void initProfileImage() async {
    profileImageLoaded = false;
    profileImage = await getRawImageData(widget.data["image_url"]);
    setState(() {
      profileImageLoaded = true;
    });
  }

  void chooseTag(index) {
    setState(() {
      selectedTagIndex = selectedTagIndex == index ? -1 : index;
    });
  }

  @override
  Widget build(BuildContext context) {
    var tagList = widget.data["tags"];
    double myPostsHeight = MediaQuery.of(context).size.height - 178;

    void sendFriendRequest() async {
      dynamic body = {"username": widget.data["user_profile"]["username"]};

      dynamic message =
          await postWithCSRF(EndPoints.addFriendRequest.endpoint, body);

      if (message == "ok") {
        showSuccessDialog(context, "Friend request sent!");
      } else {
        showErrorDialog(context, message);
      }
    }

    void deleteFriend() async {
      dynamic body = {"username": widget.data["user_profile"]["username"]};

      dynamic message =
          await postWithCSRF(EndPoints.deleteFriend.endpoint, body);

      if (message == "friend deleted") {
        widget.onDeleteFriendCallBack();
        AutoRouter.of(context).pop().then((value) =>
            showSuccessDialog(context, "Successfully removed friend!"));
      } else {
        showErrorDialog(context, message);
      }
    }

    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        toolbarHeight: 80,
        backgroundColor: Colors.lightBlue,
        titleSpacing: 0,
        title: Row(
          children: [
            SizedBox(
              height: 50,
              width: 50,
              child: IconButton(
                padding: EdgeInsets.zero,
                icon: profileImageLoaded
                    ? Image.memory(profileImage)
                    : const CircularProgressIndicator(),
                onPressed: () {
                  AutoRouter.of(context).push(
                      SinglePhotoViewer(photoBytes: profileImage, actions: []));
                },
                iconSize: 50,
              ),
            ),
            const Padding(padding: EdgeInsets.all(5)),
            Column(children: [
              SizedBox(
                height: 25,
                width: 130,
                child: Text(
                  widget.data["user_profile"]["name"],
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.only(left: 1),
                height: 20,
                width: 130,
                child: Text(
                  widget.data["user_profile"]["username"],
                  style: const TextStyle(fontSize: 14, color: Colors.blueGrey),
                ),
              ),
            ]),
          ],
        ),
        actions: [
          widget.data["is_friend"]
              ? Column(
                  children: [
                    const Padding(padding: EdgeInsets.all(3)),
                    SizedBox(
                      height: 40,
                      child: IconButton(
                        icon: const Icon(Icons.remove_circle),
                        onPressed: () {
                          showConfirmationDialog(
                              context,
                              "Are you sure to unfriend ${widget.data["user_profile"]["name"]}?",
                              deleteFriend);
                        },
                        iconSize: 35,
                      ),
                    ),
                    const SizedBox(
                      height: 30,
                      child: Text(
                        "Unfriend",
                        style: TextStyle(
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                )
              : Column(
                  children: [
                    const Padding(padding: EdgeInsets.all(3)),
                    SizedBox(
                      height: 40,
                      child: IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: () {
                          showConfirmationDialog(
                              context,
                              "Are you sure to send a friend request?",
                              sendFriendRequest);
                        },
                        iconSize: 35,
                      ),
                    ),
                    const SizedBox(
                      height: 30,
                      child: Text(
                        "Add",
                        style: TextStyle(
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
          Column(
            children: [
              const Padding(padding: EdgeInsets.all(3)),
              SizedBox(
                height: 40,
                child: IconButton(
                  icon: const Icon(Icons.pentagon),
                  onPressed: () => AutoRouter.of(context).push(AchievementRoute(
                      name: widget.data["user_profile"]["name"],
                      myProfile: false)),
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
          Container(padding: const EdgeInsets.all(5)),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Tags
          SizedBox(
            height: 65,
            child: Flex(direction: Axis.horizontal, children: [
              Expanded(
                child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: tagList.length + 1,
                    scrollDirection: Axis.horizontal,
                    itemBuilder: (BuildContext context, int index) {
                      return index == 0
                          ? const Padding(padding: EdgeInsets.all(6))
                          : SizedBox(
                              width: 45,
                              height: 45,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  IconButton(
                                    onPressed: () {
                                      chooseTag(index);
                                    },
                                    icon: dataLoaded[index - 1]
                                        ? Image.memory(tagIcons[index - 1], width: 45, height: 45, fit: BoxFit.cover)
                                        : const CircularProgressIndicator(),
                                    padding: const EdgeInsets.all(4),
                                  ),
                                  selectedTagIndex == index
                                      ? const Divider(
                                          height: 3,
                                          thickness: 2.5,
                                          indent: 4,
                                          endIndent: 4,
                                          color: Colors.blue,
                                        )
                                      : Container(),
                                ],
                              ));
                    }),
              )
            ]),
          ),
          const Divider(
            height: 1,
            thickness: 0.3,
            color: Colors.blueGrey,
            indent: 15,
            endIndent: 15,
          ),
          // TODO: Change to Posts class
          // The Posts should return a column whose width is full width of phone
          // and pass this column to a flex expanded so that can scroll down
          SizedBox(
              height: myPostsHeight,
              width: MediaQuery.of(context).size.width,
              child: profilePostsLoaded
                  ? PostListView(
                      postList: profilePosts,
                      isInProfile: true,
                      isMyPost: false,
                      updateCallBack: loadData,
                    )
                  : const CircularProgressIndicator()),
        ],
      ),
    );
  }
}
