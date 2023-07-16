import 'dart:typed_data';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/features/posts/post_listview.dart';
import 'dart:convert';

import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/router/router.gr.dart';

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

  @override
  void initState() {
    super.initState();
    loadData();
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
    loadProfilePosts();
  }

  void loadProfilePosts() async {
    profilePostsLoaded = false;
    Map<String, dynamic> requestBody = {
      "start": DateTime(2023).microsecondsSinceEpoch.toDouble() / 1000000,
      "end": DateTime(2099).microsecondsSinceEpoch.toDouble() / 1000000,
    };
    if (selectedTagIndex != -1) {
      requestBody["tag"] = data["tags"][selectedTagIndex - 1]["name"];
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
    // app bar: 80, taglist: 65, divider: 10, selected tag info: 50,
    // bottom navigation bar: 82, buffer: 13
    double myPostsHeight = MediaQuery.of(context).size.height - 300;

    return data != null
        ? Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Tags
              SizedBox(
                height: 60,
                child: Flex(direction: Axis.horizontal, children: [
                  Expanded(
                    child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: tagList.length + 2,
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (BuildContext context, int index) {
                          return index == 0
                              ? const Padding(padding: EdgeInsets.all(6))
                              : index < tagList.length + 1
                                  ? tagList[index - 1] == ""
                                      ? Container()
                                      : SizedBox(
                                          width: 45,
                                          height: 45,
                                          child: Column(
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              IconButton(
                                                onPressed: () =>
                                                    {chooseTag(index)},
                                                icon: dataLoaded[index - 1]
                                                    ? Image.memory(
                                                        tagIcons[index - 1],
                                                        width: 45,
                                                        height: 45,
                                                        fit: BoxFit.contain)
                                                    : const CircularProgressIndicator(),
                                                padding:
                                                    const EdgeInsets.all(3),
                                              ),
                                              selectedTagIndex == index
                                                  ? const Divider(
                                                      height: 3,
                                                      thickness: 2.5,
                                                      indent: 4,
                                                      endIndent: 4,
                                                      color: Colors.blue,
                                                    )
                                                  : Container()
                                            ],
                                          ))
                                  : IconButton(
                                      onPressed: () => AutoRouter.of(context)
                                          .push(AddTagRoute(
                                              updateCallBack: loadData)),
                                      icon: const Icon(
                                          Icons.add_circle_outline_rounded),
                                      iconSize: 45,
                                      padding: EdgeInsets.zero,
                                    );
                        }),
                  )
                ]),
              ),
              
              // selected tag info, create post button
              SizedBox(
                height: 50,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          "My posts about",
                          style: TextStyle(fontSize: 14),
                        ),
                        Text(
                          selectedTagIndex == -1
                              ? "any tag"
                              : "\"${tagList[selectedTagIndex - 1]["name"]}\"",
                          style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Colors.black),
                        )
                      ],
                    ),
                    const Padding(padding: EdgeInsets.only(left: 10)),
                    TextButton(
                      onPressed: () {
                        if (selectedTagIndex == -1) {
                          showCustomDialog(context, "Hold on",
                              "Please select a tag you want to post about!");
                          return;
                        }
                        AutoRouter.of(context).push(CreatePostRoute(
                            tagName: data["tags"][selectedTagIndex - 1]["name"],
                            updateCallBack: loadProfilePosts));
                      },
                      child: const Row(children: [
                        Icon(Icons.post_add, size: 40),
                        Text(
                          "New post",
                        )
                      ]),
                    ),
                  ],
                ),
              ),

              const Divider(
                color: Colors.blueGrey,
                height: 1,
                thickness: 0.3,
                indent: 15,
                endIndent: 15,
              ),

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
                              isInProfile: true,
                              isMyPost: true,
                              updateCallBack: loadProfilePosts,
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
