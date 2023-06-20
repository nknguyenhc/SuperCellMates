import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:math';

import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

@RoutePage()
class EditPostPage extends StatefulWidget {
  const EditPostPage({
    Key? key,
    required this.tagName,
    required this.oldPostData,
    required this.oldPostImages,
    this.refreshCallBack,
  }) : super(key: key);

  final dynamic oldPostData;
  final dynamic oldPostImages;
  final String tagName;
  final dynamic refreshCallBack;

  @override
  State<EditPostPage> createState() => EditPostPageState();
}

class EditPostPageState extends State<EditPostPage> {
  String visibility = "Public";
  List<String> visibilityDescriptions = [
    "Visible to everyone",
    "Limit to my friends",
    "Limit to tag holders"
  ];
  bool showVisibilites = false;
  List<bool> isVisibilitiesChosen = [false, false, false];

  String postTitle = "";
  String postContent = "";

  ImagePicker imagePicker = ImagePicker();
  List<Uint8List> postImages = [];
  int imageCount = 0;
  List<Widget> imagesPreview = List<Widget>.filled(
      9,
      const SizedBox(
        width: 90,
        height: 90,
      ));

  @override
  void initState() {
    super.initState();
    if (widget.oldPostData["friend_visible"]) {
      isVisibilitiesChosen[1] = true;
    }
    if (widget.oldPostData["tag_visible"]) {
      isVisibilitiesChosen[2] = true;
    }
    if (widget.oldPostData["public_visible"]) {
      isVisibilitiesChosen[0] = true;
      isVisibilitiesChosen[1] = false;
      isVisibilitiesChosen[2] = false;
    }
    setVisibilityText();
    postTitle = widget.oldPostData["title"];
    postContent = widget.oldPostData["content"];
    postImages = widget.oldPostImages;
    imageCount = postImages.length;
    for (int i = 0; i < imageCount; i++) {
      imagesPreview[i] =
          Image.memory(postImages[i], width: 90, height: 90, fit: BoxFit.cover);
    }
  }

  void collapseVisibilities() {
    setState(() {
      showVisibilites = false;
    });
  }

  void setVisibility(int index) {
    isVisibilitiesChosen[index] = !isVisibilitiesChosen[index];

    // resolve conflicts
    if (isVisibilitiesChosen[0] &&
        (isVisibilitiesChosen[1] || isVisibilitiesChosen[2])) {
      // keep the most recently updated one
      if (index == 0) {
        isVisibilitiesChosen[1] = false;
        isVisibilitiesChosen[2] = false;
      } else {
        isVisibilitiesChosen[0] = false;
      }
    }

    if (!(isVisibilitiesChosen[0] ||
        isVisibilitiesChosen[1] ||
        isVisibilitiesChosen[2])) {
      isVisibilitiesChosen[0] = true;
    }

    setVisibilityText();
  }

  void setVisibilityText() {
    setState(() {
      visibility = isVisibilitiesChosen[0]
          ? "Public"
          : isVisibilitiesChosen[1] && isVisibilitiesChosen[2]
              ? "Friends with Tag"
              : isVisibilitiesChosen[1]
                  ? "Friends"
                  : "Tag";
    });
  }

  void resolveVisibilityConflicts() {}

  void setImage(int index, XFile img) {
    imageCount++;
    img.readAsBytes().then((value) {
      setState(() {
        postImages.add(value);
        imagesPreview[index] =
            Image.memory(value, width: 90, height: 90, fit: BoxFit.cover);
      });
    });
  }

  void editPost() async {
    if (postTitle == "") {
      showCustomDialog(context, "Oops", "Post title cannot be empty");
      return;
    } else if (postContent == "") {
      showCustomDialog(context, "Oops", "Post content cannot be empty");
      return;
    }

    List<String> postVisibility = [];
    if (isVisibilitiesChosen[0]) {
      postVisibility.add("public");
    }
    if (isVisibilitiesChosen[1]) {
      postVisibility.add("friends");
    }
    if (isVisibilitiesChosen[2]) {
      postVisibility.add("tag");
    }

    Map<String, dynamic> body = {
      "title": postTitle,
      "content": postContent,
      "imgs": postImages,
      "visibility_async": postVisibility,
    };

    dynamic r = await postWithCSRF(
        EndPoints.editPost.endpoint + widget.oldPostData["id"], body);

    if (r == "post updated") {
      widget.refreshCallBack();
      AutoRouter.of(context).pop().then(
          (value) => showSuccessDialog(context, "Successfully updated post!"));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: AppBar(
          titleSpacing: 0,
          title: const Text("Edit a post"),
          actions: [
            IconButton(
                onPressed: () {
                  collapseVisibilities();
                  FocusManager.instance.primaryFocus?.unfocus();
                  showConfirmationDialog(
                      context, "Are you sure to update this post?", editPost);
                },
                icon: const Icon(Icons.add_task)),
            const Padding(padding: EdgeInsets.only(right: 20))
          ],
        ),
        body: Container(
            alignment: Alignment.center,
            child: Stack(children: [
              // column contains the body of this page
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                // post title
                Row(
                  children: [
                    const Padding(padding: EdgeInsets.all(10)),
                    SizedBox(
                      width: MediaQuery.of(context).size.width - 150,
                      child: TextFormField(
                        initialValue: widget.oldPostData["title"],
                        onTap: collapseVisibilities,
                        onTapOutside: (e) =>
                            FocusManager.instance.primaryFocus?.unfocus(),
                        decoration: const InputDecoration(
                            isDense: true,
                            contentPadding: EdgeInsets.fromLTRB(8, 0, 0, 1),
                            hintText: "Post title",
                            hintStyle:
                                TextStyle(color: Colors.grey, fontSize: 18)),
                        style: const TextStyle(
                          fontSize: 18,
                        ),
                        onChanged: (input) {
                          postTitle = input;
                        },
                      ),
                    )
                  ],
                ),

                const Padding(
                  padding: EdgeInsets.all(10),
                ),

                // Post content
                Row(
                  children: [
                    const Padding(padding: EdgeInsets.all(10)),
                    SizedBox(
                        width: MediaQuery.of(context).size.width - 40,
                        height: MediaQuery.of(context).size.height - 555,
                        child: TextFormField(
                          initialValue: widget.oldPostData["content"],
                          onTap: collapseVisibilities,
                          onTapOutside: (e) =>
                              FocusManager.instance.primaryFocus?.unfocus(),
                          decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.fromLTRB(8, 15, 0, 0),
                              hintText: "Post content",
                              hintStyle:
                                  TextStyle(color: Colors.grey, fontSize: 14)),
                          style: const TextStyle(fontSize: 16),
                          maxLines: 10,
                          onChanged: (input) {
                            postContent = input;
                          },
                        ))
                  ],
                ),

                const Padding(
                  padding: EdgeInsets.all(10),
                ),

                // Post images
                Row(
                  children: [
                    const Padding(padding: EdgeInsets.only(left: 20)),
                    Container(
                      alignment: Alignment.topLeft,
                      width: MediaQuery.of(context).size.width - 40,
                      height: 340,
                      decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.grey,
                            width: 1,
                          ),
                          borderRadius:
                              const BorderRadius.all(Radius.circular(3))),
                      child: Column(children: [
                        Row(
                          children: [
                            const Padding(padding: EdgeInsets.only(left: 25)),
                            IconButton(
                                onPressed: () async {
                                  List<XFile?> imgs =
                                      await imagePicker.pickMultiImage();
                                  for (XFile? img in imgs) {
                                    if (img != null) {
                                      if (imageCount >= 9) {
                                        showCustomDialog(
                                            context,
                                            "Too many images",
                                            "Please only pick up to 9 images");
                                        return;
                                      }
                                      setImage(imageCount, img);
                                    }
                                  }
                                },
                                icon: const Icon(
                                  Icons.photo_library,
                                  size: 35,
                                )),
                            const Text(
                              "Pick up to 9 images",
                              style: TextStyle(
                                  color: Colors.blueGrey,
                                  fontWeight: FontWeight.bold),
                            )
                          ],
                        ),
                        Column(
                          children: [
                            SizedBox(
                              // TODO: Change to grid view
                              width: MediaQuery.of(context).size.width - 40,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  imagesPreview[0],
                                  const Padding(padding: EdgeInsets.all(3)),
                                  imagesPreview[1],
                                  const Padding(padding: EdgeInsets.all(3)),
                                  imagesPreview[2],
                                ],
                              ),
                            ),
                            const Padding(padding: EdgeInsets.all(3)),
                            SizedBox(
                              width: MediaQuery.of(context).size.width - 40,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  imagesPreview[3],
                                  const Padding(padding: EdgeInsets.all(3)),
                                  imagesPreview[4],
                                  const Padding(padding: EdgeInsets.all(3)),
                                  imagesPreview[5],
                                ],
                              ),
                            ),
                            const Padding(padding: EdgeInsets.all(3)),
                            SizedBox(
                              width: MediaQuery.of(context).size.width - 40,
                              child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    imagesPreview[6],
                                    const Padding(padding: EdgeInsets.all(3)),
                                    imagesPreview[7],
                                    const Padding(padding: EdgeInsets.all(3)),
                                    imagesPreview[8],
                                  ]),
                            ),
                          ],
                        )
                      ]),
                    ),
                  ],
                ),

                // Bottom Bar
                SizedBox(
                  height: 40,
                  width: MediaQuery.of(context).size.width,
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Tag name indicator
                        Text(
                          "Tag: \"${widget.tagName}\"",
                          style: const TextStyle(
                            fontSize: 16,
                          ),
                        ),
                        const Padding(padding: EdgeInsets.only(left: 10)),

                        // Visibility button
                        TextButton(
                            onPressed: () {
                              setState(() {
                                showVisibilites = !showVisibilites;
                              });
                            },
                            style: const ButtonStyle(
                                backgroundColor:
                                    MaterialStatePropertyAll(Colors.white),
                                iconColor:
                                    MaterialStatePropertyAll(Colors.indigo)),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  " $visibility",
                                ),
                                Transform.rotate(
                                  angle: showVisibilites ? pi / 2 : pi / 2 * 3,
                                  child: const Icon(
                                    Icons.arrow_right,
                                  ),
                                )
                              ],
                            ))
                      ]),
                )
              ]),

              // visibility settings drawer
              // as a child of the stack, overlays the content above
              showVisibilites
                  ? Container(
                      padding: EdgeInsets.fromLTRB(
                          MediaQuery.of(context).size.width - 190,
                          MediaQuery.of(context).size.height - 300,
                          30,
                          30),
                      height: MediaQuery.of(context).size.height - 120,
                      child: Container(
                          alignment: Alignment.bottomCenter,
                          width: 160,
                          height: 150,
                          color: const Color.fromARGB(255, 223, 234, 237),
                          child: ListView.builder(
                              scrollDirection: Axis.vertical,
                              itemCount: 3,
                              itemBuilder: (context, index) {
                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    index == 0
                                        ? Container()
                                        : const Divider(
                                            height: 1,
                                            thickness: 1,
                                            indent: 12,
                                            endIndent: 25,
                                          ),
                                    Row(
                                      children: [
                                        TextButton(
                                            onPressed: () {
                                              setVisibility(index);
                                            },
                                            style: const ButtonStyle(
                                                padding:
                                                    MaterialStatePropertyAll(
                                                        EdgeInsets.only(
                                                            left: 13.5))),
                                            child: Text(
                                                visibilityDescriptions[index])),
                                        Padding(
                                            padding: EdgeInsets.only(
                                                left: index == 0
                                                    ? 6.5
                                                    : index == 1
                                                        ? 8
                                                        : 4)),
                                        isVisibilitiesChosen[index]
                                            ? const Icon(
                                                Icons.circle,
                                                size: 8,
                                              )
                                            : Container()
                                      ],
                                    )
                                  ],
                                );
                              })))
                  : Container(),
            ])));
  }
}
