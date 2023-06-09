import "dart:typed_data";
import "package:auto_route/auto_route.dart";
import "package:flutter/material.dart";

import "package:supercellmates/http_requests/get_image.dart";
import "package:supercellmates/http_requests/make_requests.dart";
import "package:supercellmates/router/router.gr.dart";
import "package:supercellmates/http_requests/endpoints.dart";
import "package:supercellmates/features/dialogs.dart";
import 'package:intl/intl.dart';

class PostListView extends StatefulWidget {
  const PostListView({
    Key? key,
    required this.postList,
    required this.isInProfile,
    required this.isMyPost,
    required this.updateCallBack,
    required this.scrollAtTopEvent,
    required this.scrollAtBottomEvent,
  }) : super(key: key);

  final dynamic postList;
  // if the posts are displayed in someone's profile,
  // the user icon should not route to user's profile page
  final bool isInProfile;
  // if the posts belong to the user themselves,
  // the user should be able to edit the post
  final bool isMyPost;
  final dynamic updateCallBack;
  final dynamic scrollAtTopEvent;
  final dynamic scrollAtBottomEvent;

  @override
  State<PostListView> createState() => PostListViewState();
}

class PostListViewState extends State<PostListView> {
  int count = 0;
  List<bool> dataLoaded = [];
  List<Uint8List> profileImages = [];
  List<List<Uint8List>?> postImagesRaw = [];
  List<dynamic> timePosted = [];

  final _controller = ScrollController();

  @override
  void initState() {
    super.initState();
    count = widget.postList.length;
    dataLoaded = List.filled(count, false, growable: true);
    profileImages = List.filled(count, Uint8List.fromList([]), growable: true);
    postImagesRaw = List.filled(count, null, growable: true);
    timePosted = List.filled(count, null, growable: true);
    for (int i = 0; i < count; i++) {
      loadImages(i);
      loadTime(i);
    }
    _controller.addListener(() {
      if (_controller.position.atEdge) {
        bool isTop = _controller.position.pixels == 0;
        if (isTop) {
          widget.scrollAtTopEvent();
        } else {
          widget.scrollAtBottomEvent();
        }
      }
    });
  }

  @override
  void didUpdateWidget(covariant PostListView oldWidget) {
    super.didUpdateWidget(oldWidget);
    loadMore();
  }

  void loadMore() {
    int currCount = dataLoaded.length;
    count = widget.postList.length;
    for (int i = currCount; i < count; i++) {
      dataLoaded.add(false);
      profileImages.add(Uint8List.fromList([]));
      postImagesRaw.add(null);
      timePosted.add(null);
      loadImages(i);
      loadTime(i);
    }
  }

  void loadImages(index) async {
    profileImages[index] = await getRawImageData(
        widget.postList[index]["creator"]["profile_pic_url"]);

    postImagesRaw[index] = List.filled(
        widget.postList[index]["images"].length, Uint8List.fromList([]),
        growable: true);
    for (int i = 0; i < widget.postList[index]["images"].length; i++) {
      postImagesRaw[index]![i] =
          await getRawImageData(widget.postList[index]["images"][i]);
    }
    setState(() {
      dataLoaded[index] = true;
    });
  }

  void loadTime(index) {
    timePosted[index] = DateTime.fromMicrosecondsSinceEpoch(
        (widget.postList[index]["time_posted"] * 1000000).toInt());
  }

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        controller: _controller,
        itemCount: count,
        itemBuilder: (context, index) {
          Uint8List profileImageRawData = profileImages[index];
          String name = widget.postList[index]["creator"]["name"];
          String username = widget.postList[index]["creator"]["username"];
          String title = widget.postList[index]["title"];
          String content = widget.postList[index]["content"];
          List<Uint8List>? images =
              dataLoaded[index] ? postImagesRaw[index] : null;
          return Column(children: [
            // post creator info header
            TextButton(
              onPressed: widget.isInProfile
                  ? () {}
                  : () async {
                      FocusManager.instance.primaryFocus?.unfocus();
                      AutoRouter.of(context)
                          .push(OthersProfileRoute(username: username));
                    },
              child: Row(children: [
                const Padding(padding: EdgeInsets.only(left: 5)),
                SizedBox(
                  height: 40,
                  width: 40,
                  child: dataLoaded[index]
                      ? IconButton(
                          onPressed: () {
                            AutoRouter.of(context).push(SinglePhotoViewer(
                                photoBytes: profileImageRawData, actions: []));
                          },
                          icon: Image.memory(profileImageRawData),
                          iconSize: 40,
                          padding: EdgeInsets.zero,
                        )
                      : const CircularProgressIndicator(),
                ),
                const Padding(padding: EdgeInsets.all(5)),
                Column(
                  children: [
                    const Padding(padding: EdgeInsets.all(2)),
                    SizedBox(
                      width: MediaQuery.of(context).size.width - 85,
                      child: Text(
                        name,
                        style:
                            const TextStyle(color: Colors.black, fontSize: 15),
                      ),
                    ),
                    SizedBox(
                      width: MediaQuery.of(context).size.width - 85,
                      child: Text(username,
                          style: const TextStyle(
                            color: Colors.blueGrey,
                            fontSize: 12,
                          )),
                    ),
                    const Padding(padding: EdgeInsets.all(2)),
                  ],
                )
              ]),
            ),

            // Post body: title, content, images
            SizedBox(
              width: MediaQuery.of(context).size.width,
              child: Row(
                children: [
                  const Padding(padding: EdgeInsets.all(10)),
                  Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Padding(padding: EdgeInsets.only(left: 10)),
                            SizedBox(
                              width: MediaQuery.of(context).size.width - 40,
                              child: Text(
                                title,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 17),
                              ),
                            )
                          ],
                        ),
                        const Padding(padding: EdgeInsets.only(top: 5)),
                        Row(
                          children: [
                            const Padding(padding: EdgeInsets.only(left: 10)),
                            SizedBox(
                              width: MediaQuery.of(context).size.width - 40,
                              child: Text(
                                content,
                                style: const TextStyle(fontSize: 14),
                              ),
                            )
                          ],
                        ),
                        const Padding(padding: EdgeInsets.only(top: 10)),
                        // images
                        dataLoaded[index]
                            ? images!.isEmpty
                                ? Container()
                                : Column(
                                    children: [
                                      const Padding(
                                          padding: EdgeInsets.only(top: 10)),
                                      images.length < 5
                                          ? SizedBox(
                                              width: MediaQuery.of(context)
                                                      .size
                                                      .width -
                                                  40,
                                              height: images.length < 3
                                                  ? MediaQuery.of(context)
                                                              .size
                                                              .width /
                                                          2 -
                                                      20
                                                  : MediaQuery.of(context)
                                                          .size
                                                          .width -
                                                      45,
                                              child: GridView.builder(
                                                itemCount: images.length,
                                                shrinkWrap: true,
                                                padding: const EdgeInsets.only(
                                                    left: 10, right: 10),
                                                physics:
                                                    const NeverScrollableScrollPhysics(),
                                                gridDelegate:
                                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                                        crossAxisCount: 2,
                                                        mainAxisSpacing: 10,
                                                        crossAxisSpacing: 10),
                                                itemBuilder:
                                                    (context, imageIndex) {
                                                  return IconButton(
                                                      splashColor:
                                                          Colors.transparent,
                                                      highlightColor:
                                                          Colors.transparent,
                                                      padding: EdgeInsets.zero,
                                                      onPressed: () => AutoRouter
                                                              .of(context)
                                                          .push(MultiplePhotosViewer(
                                                              listOfPhotoBytes:
                                                                  postImagesRaw[
                                                                      index]!,
                                                              initialIndex:
                                                                  imageIndex,
                                                              actionFunction:
                                                                  null)),
                                                      icon: Image.memory(
                                                        images[imageIndex],
                                                        width: MediaQuery.of(
                                                                    context)
                                                                .size
                                                                .width /
                                                            2,
                                                        height: MediaQuery.of(
                                                                    context)
                                                                .size
                                                                .width /
                                                            2,
                                                        fit: BoxFit.cover,
                                                      ));
                                                },
                                              ),
                                            )
                                          : SizedBox(
                                              width: MediaQuery.of(context)
                                                      .size
                                                      .width -
                                                  40,
                                              height: images.length < 7
                                                  ? MediaQuery.of(context)
                                                              .size
                                                              .width *
                                                          2 /
                                                          3 -
                                                      27
                                                  : MediaQuery.of(context)
                                                          .size
                                                          .width -
                                                      65,
                                              child: GridView.builder(
                                                itemCount: images.length,
                                                shrinkWrap: true,
                                                padding: const EdgeInsets.only(
                                                    left: 10, right: 10),
                                                physics:
                                                    const NeverScrollableScrollPhysics(),
                                                gridDelegate:
                                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                                        crossAxisCount: 3,
                                                        mainAxisSpacing: 10,
                                                        crossAxisSpacing: 10),
                                                itemBuilder:
                                                    (context, imageIndex) {
                                                  return IconButton(
                                                      splashColor:
                                                          Colors.transparent,
                                                      highlightColor:
                                                          Colors.transparent,
                                                      padding: EdgeInsets.zero,
                                                      onPressed: () => AutoRouter
                                                              .of(context)
                                                          .push(MultiplePhotosViewer(
                                                              listOfPhotoBytes:
                                                                  postImagesRaw[
                                                                      index]!,
                                                              initialIndex:
                                                                  imageIndex,
                                                              actionFunction:
                                                                  null)),
                                                      icon: Image.memory(
                                                        images[imageIndex],
                                                        width: MediaQuery.of(
                                                                    context)
                                                                .size
                                                                .width /
                                                            2,
                                                        height: MediaQuery.of(
                                                                    context)
                                                                .size
                                                                .width /
                                                            2,
                                                        fit: BoxFit.cover,
                                                      ));
                                                },
                                              ),
                                            )
                                    ],
                                  )
                            : const CircularProgressIndicator(),
                      ])
                ],
              ),
            ),

            // tag, edit and delete
            SizedBox(
                width: MediaQuery.of(context).size.width,
                height: 25,
                child: Stack(children: [
                  Container(
                    padding: const EdgeInsets.only(left: 30),
                    child: Text(
                      "#${widget.postList[index]["tag"]["name"]}",
                      style: const TextStyle(color: Colors.pink),
                    ),
                  ),
                  widget.isMyPost && dataLoaded[index]
                      ? SizedBox(
                          width: MediaQuery.of(context).size.width,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              SizedBox(
                                width: 30,
                                child: IconButton(
                                  onPressed: () {
                                    AutoRouter.of(context).push(EditPostRoute(
                                        tagName: widget.postList[index]["tag"]
                                            ["name"],
                                        oldPostData: widget.postList[index],
                                        oldPostImages: postImagesRaw[index],
                                        updateCallBack: widget.updateCallBack));
                                  },
                                  icon: const Icon(
                                    Icons.edit_outlined,
                                    color: Colors.black,
                                  ),
                                  iconSize: 20,
                                ),
                              ),
                              const Padding(padding: EdgeInsets.only(left: 10)),
                              SizedBox(
                                  width: 30,
                                  child: IconButton(
                                    onPressed: () {
                                      showConfirmationDialog(context,
                                          "Are you sure to delete this post?",
                                          () async {
                                        startUploadingDialog(context, "data");
                                        dynamic body = {
                                          "post_id": widget.postList[index]
                                              ["id"],
                                        };
                                        dynamic r = await postWithCSRF(
                                            EndPoints.deletePost.endpoint,
                                            body);
                                        stopLoadingDialog(context);
                                        Future.delayed(
                                                Duration(milliseconds: 100))
                                            .then((value) {
                                          if (r == "post deleted") {
                                            widget.updateCallBack();
                                            showSuccessDialog(context,
                                                "Successfully deleted post");
                                          } else {
                                            showErrorDialog(context, r);
                                          }
                                        });
                                      });
                                    },
                                    icon: const Icon(
                                      Icons.delete,
                                      color: Colors.pink,
                                    ),
                                    iconSize: 20,
                                  )),
                              const Padding(
                                  padding: EdgeInsets.only(right: 20)),
                            ],
                          ))
                      : Container()
                ])),

            // post time
            SizedBox(
              width: MediaQuery.of(context).size.width,
              height: 25,
              child: Row(
                children: [
                  const Padding(padding: EdgeInsets.only(left: 30)),
                  Text(
                    DateFormat('yyyy-MM-dd HH:mm').format(timePosted[index]),
                    style: const TextStyle(color: Colors.blueGrey),
                  ),
                ],
              ),
            ),

            const Padding(padding: EdgeInsets.only(top: 5)),

            const Divider(
              height: 1,
              thickness: 0.3,
              color: Colors.blueGrey,
              indent: 15,
              endIndent: 15,
            )
          ]);
        });
    return list;
  }
}
