import 'dart:typed_data';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
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
    data = jsonDecode(await getRequest(EndPoints.profileIndex.endpoint, null));
    tagListCount = data["tags"].length;
    dataLoaded = List<bool>.filled(tagListCount, false, growable: true);
    tagIcons = List<Uint8List>.filled(tagListCount, Uint8List.fromList([]),
        growable: true);
    for (int i = 0; i < tagListCount; i++) {
      loadTagIcons(i);
    }
    setState(() => data = data);
    profilePostsLoaded = false;
    dynamic profilePostsResponse = jsonDecode(await getRequest(
        EndPoints.getProfilePosts.endpoint + data["user_profile"]["username"],
        {"start": "2023-01-01-00-00-00", "end": "2099-01-01-00-00-00"}));
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
  }

  @override
  Widget build(BuildContext context) {
    var tagList = data != null ? data["tags"] : null;
    // app bar: 80, taglist: 65, divider: 10, selected tag info: 70,
    // bottom navigation bar: 82, buffer: 25
    double myPostsHeight = selectedTagIndex == -1
        ? MediaQuery.of(context).size.height - 252
        : MediaQuery.of(context).size.height - 312;

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
                                              updateCallBack:
                                                  widget.updateCallBack))
                                          .then((value) => loadData()),
                                      icon: const Icon(
                                          Icons.add_circle_outline_rounded),
                                      iconSize: 45,
                                      padding: EdgeInsets.zero,
                                    );
                        }),
                  )
                ]),
              ),
              selectedTagIndex == -1
                  ? Container()
                  : const Divider(
                      height: 1,
                      thickness: 0.5,
                      color: Colors.blue,
                    ),

              // selected tag info, create post button
              selectedTagIndex == -1
                  ? Container()
                  : SizedBox(
                      height: 60,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text(
                                "My posts about the tag",
                                style: TextStyle(fontSize: 14),
                              ),
                              Text(
                                "\"${tagList[selectedTagIndex - 1]["name"]}\"",
                                style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black),
                              )
                            ],
                          ),
                          const Padding(padding: EdgeInsets.only(left: 20)),
                          TextButton(
                            onPressed: () {
                              if (selectedTagIndex == -1) {
                                showCustomDialog(context, "Hold on",
                                    "Please select a tag you want to post about!");
                                return;
                              }
                              AutoRouter.of(context).push(CreatePostRoute(
                                  tagName: data["tags"][selectedTagIndex - 1]
                                      ["name"],
                                  updateCallBack: loadData));
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
              SizedBox(
                  height: myPostsHeight,
                  width: MediaQuery.of(context).size.width,
                  child: profilePostsLoaded
                      ? PostListView(
                          postList: profilePosts,
                          isInProfile: true,
                          isMyPost: true,
                          updateCallBack: loadData,
                          scrollAtTopEvent: () {},
                          scrollAtBottomEvent: () {},
                        )
                      : const CircularProgressIndicator()),
            ],
          )
        : const CircularProgressIndicator();
  }
}
