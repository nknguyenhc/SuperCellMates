import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:math';

import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

@RoutePage()
class CreatePostPage extends StatefulWidget {
  const CreatePostPage(
      {Key? key, required this.tagName, required this.updateCallBack})
      : super(key: key);

  final String tagName;
  final dynamic updateCallBack;

  @override
  State<CreatePostPage> createState() => CreatePostPageState();
}

class CreatePostPageState extends State<CreatePostPage> {
  String visibility = "Public";
  List<String> visibilityDescriptions = [
    "Visible to everyone",
    "Limit to my friends",
    "Limit to tag holders"
  ];
  bool showVisibilites = false;
  List<bool> isVisibilitiesChosen = [true, false, false];

  String postTitle = "";
  String postContent = "";

  ImagePicker imagePicker = ImagePicker();
  List<Uint8List> postImages = [];
  int imageCount = 0;
  double previewImageWidth = 0;
  List<Widget?> imagesPreview = List.filled(9, null, growable: true);

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

    // set visibility text
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

  void removeImage(int index) {
    imageCount--;
    setState(() {
      postImages.removeAt(index);
      imagesPreview.removeAt(index);
      imagesPreview.add(null);
    });
  }

  void createPost() async {
    if (postTitle == "") {
      showCustomDialog(context, "Oops", "Post title cannot be empty");
      return;
    } else if (postContent == "") {
      showCustomDialog(context, "Oops", "Post content cannot be empty");
      return;
    }

    startUploadingDialog(context, "post");
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
      "tag": widget.tagName,
      "imgs": postImages,
      "visibility_async": postVisibility,
    };

    dynamic r = await postWithCSRF(EndPoints.createPost.endpoint, body);

    stopLoadingDialog(context);
    Future.delayed(Duration(milliseconds: 100)).then((value) {
      if (r == "post created") {
        widget.updateCallBack();
        AutoRouter.of(context).pop().then((value) =>
            showSuccessDialog(context, "Successfully created post!"));
      } else {
        showErrorDialog(context, r);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    previewImageWidth = (MediaQuery.of(context).size.width - 100) / 3;
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: AppBar(
          titleSpacing: 0,
          title: const Text("Create a post"),
          actions: [
            IconButton(
                onPressed: () {
                  collapseVisibilities();
                  FocusManager.instance.primaryFocus?.unfocus();
                  showConfirmationDialog(
                      context, "Are you sure to create this post?", createPost);
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
                      child: TextField(
                        maxLength: 100,
                        onTap: collapseVisibilities,
                        onTapOutside: (e) =>
                            FocusManager.instance.primaryFocus?.unfocus(),
                        decoration: const InputDecoration(
                            isDense: true,
                            contentPadding: EdgeInsets.fromLTRB(8, 0, 0, 1),
                            counterText: "",
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
                        height: MediaQuery.of(context).size.height - 575,
                        child: TextField(
                          maxLength: 2000,
                          onTap: collapseVisibilities,
                          onTapOutside: (e) =>
                              FocusManager.instance.primaryFocus?.unfocus(),
                          decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.fromLTRB(8, 15, 0, 0),
                              counterText: "",
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
                      width: MediaQuery.of(context).size.width - 40,
                      height: previewImageWidth * 3 + 60,
                      decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.grey,
                            width: 1,
                          ),
                          borderRadius:
                              const BorderRadius.all(Radius.circular(3))),
                      child: Column(children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            TextButton(
                                onPressed: () async {
                                  collapseVisibilities();
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
                                child: const Row(
                                  children: [
                                    Icon(
                                      Icons.photo_library,
                                      size: 35,
                                    ),
                                    Padding(padding: EdgeInsets.only(left: 10)),
                                    Text(
                                      "Pick up to 9 images",
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                )),
                            const Padding(padding: EdgeInsets.only(right: 20)),
                          ],
                        ),
                        SizedBox(
                            width: MediaQuery.of(context).size.width - 100,
                            height: previewImageWidth * 3,
                            child: GridView.builder(
                              itemCount: 9,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 3,
                                      mainAxisSpacing: 10,
                                      crossAxisSpacing: 10),
                              itemBuilder: (context, imageIndex) {
                                return imageIndex < imageCount
                                    ? IconButton(
                                        splashColor: Colors.transparent,
                                        highlightColor: Colors.transparent,
                                        padding: EdgeInsets.zero,
                                        onPressed: () {
                                          collapseVisibilities();
                                          AutoRouter.of(context)
                                              .push(MultiplePhotosViewer(
                                                  listOfPhotoBytes: postImages,
                                                  initialIndex: imageIndex,
                                                  actionFunction: (currIndex) {
                                                    return [
                                                      IconButton(
                                                        onPressed: () {
                                                          showConfirmationDialog(
                                                              context,
                                                              "Are you sure to remove this image?",
                                                              () {
                                                            removeImage(
                                                                currIndex);
                                                            AutoRouter.of(
                                                                    context)
                                                                .pop();
                                                          });
                                                        },
                                                        icon:
                                                            Icon(Icons.delete),
                                                      )
                                                    ];
                                                  }));
                                        },
                                        icon: imagesPreview[imageIndex] ??
                                            SizedBox(
                                              width: previewImageWidth,
                                              height: previewImageWidth,
                                            ),
                                      )
                                    : SizedBox(
                                        width: previewImageWidth,
                                        height: previewImageWidth,
                                      );
                              },
                            ))
                      ]),
                    ),
                  ],
                ),
              ]),

              // Bottom Bar
              Positioned(
                bottom: 20,
                child: SizedBox(
                  height: 30,
                  width: MediaQuery.of(context).size.width,
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Tag name indicator
                        Text(
                          "Tag: \"${widget.tagName}\"",
                          style: const TextStyle(
                            fontSize: 14,
                          ),
                        ),
                        const Padding(padding: EdgeInsets.only(left: 20)),

                        // Visibility button
                        TextButton(
                            onPressed: () {
                              setState(() {
                                showVisibilites = !showVisibilites;
                              });
                            },
                            style: const ButtonStyle(
                                padding:
                                    MaterialStatePropertyAll(EdgeInsets.zero),
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
                ),
              ),

              // visibility settings drawer
              // as a child of the stack, overlays the content above
              showVisibilites
                  ? Positioned(
                      bottom: 60,
                      right: 30,
                      top: MediaQuery.of(context).size.height - 290,
                      child: SizedBox(
                          child: Container(
                              alignment: Alignment.bottomCenter,
                              width: 180,
                              height: 150,
                              color: const Color.fromARGB(255, 223, 234, 237),
                              child: ListView.builder(
                                  scrollDirection: Axis.vertical,
                                  itemCount: 3,
                                  itemBuilder: (context, index) {
                                    return Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.center,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        index == 0
                                            ? Container()
                                            : const Divider(
                                                height: 1,
                                                thickness: 1,
                                                indent: 20,
                                                endIndent: 20,
                                              ),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
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
                                                    visibilityDescriptions[
                                                        index])),
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
                                                : Container(),
                                            const Padding(
                                                padding:
                                                    EdgeInsets.only(right: 10))
                                          ],
                                        )
                                      ],
                                    );
                                  }))))
                  : Container(),
            ])));
  }
}
