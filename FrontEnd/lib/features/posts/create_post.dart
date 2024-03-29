import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:get_it/get_it.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supercellmates/config/config.dart';
import 'dart:math';

import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

@RoutePage()
class CreatePostPage extends StatefulWidget {
  const CreatePostPage({
    Key? key,
    required this.isEdit,
    required this.tagName,
    required this.updateCallBack,
    this.oldPostData,
    this.oldPostImages,
  }) : super(key: key);

  final bool isEdit;
  final String tagName;
  final dynamic updateCallBack;
  final dynamic oldPostData;
  final dynamic oldPostImages;

  @override
  State<CreatePostPage> createState() => CreatePostPageState();
}

class CreatePostPageState extends State<CreatePostPage> {
  String visibilityButtonText = "public";
  List<String> visibilityDescriptions = [
    "Visible to everyone",
    "My friends",
    "People with same tag",
    "Friends with same tag",
  ];
  bool showVisibilites = false;
  List<bool> isVisibilitiesChosen = [false, false, false];

  late TextEditingController titleController;
  late TextEditingController contentController;

  ImagePicker imagePicker = ImagePicker();
  List<Uint8List> postImages = [];
  int imageCount = 0;
  double previewImageWidth = 85;
  List<Widget?> imagesPreview = List.filled(9, null, growable: true);

  @override
  void initState() {
    super.initState();
    if (!widget.isEdit) {
      isVisibilitiesChosen[0] = true;
      titleController = TextEditingController();
      contentController = TextEditingController();
    } else {
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
      titleController =
          TextEditingController(text: widget.oldPostData["title"]);
      contentController =
          TextEditingController(text: widget.oldPostData["content"]);
      postImages = widget.oldPostImages;
      imageCount = postImages.length;
      for (int i = 0; i < imageCount; i++) {
        imagesPreview[i] = Image.memory(postImages[i],
            width: previewImageWidth,
            height: previewImageWidth,
            fit: BoxFit.cover);
      }
    }
    setVisibilityText();
  }

  void toggleVisibilities() {
    setState(() {
      showVisibilites = !showVisibilites;
    });
  }

  void setVisibility(int index) {
    // 0: public, 1: friends, 2: tags, 3: friends with tags
    isVisibilitiesChosen[0] = index == 0 ? true : false;
    isVisibilitiesChosen[1] = index == 1 || index == 3 ? true : false;
    isVisibilitiesChosen[2] = index == 2 || index == 3 ? true : false;
    setVisibilityText();
  }

  void setVisibilityText() {
    setState(() {
      visibilityButtonText = isVisibilitiesChosen[0]
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
        imagesPreview[index] = Image.memory(value,
            width: previewImageWidth,
            height: previewImageWidth,
            fit: BoxFit.cover);
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
    String postTitle = titleController.text;
    String postContent = contentController.text;
    if (postTitle == "") {
      showCustomDialog(context, "Oops", "Post title cannot be empty");
      return;
    } else if (postContent == "") {
      showCustomDialog(context, "Oops", "Post content cannot be empty");
      return;
    } else {
      int totalImageBytes = 0;
      for (Uint8List img in postImages) {
        totalImageBytes += img.length;
      }
      if (totalImageBytes > GetIt.I<Config>().totalUploadLimit) {
        showCustomDialog(
            context,
            "Images are too large",
            "Your images, after compression, have a total size larger than 3MB.\n" +
                "Please try again with smaller images.\n\n" +
                "On behalf of our weak server, we apologise for your inconvenience -_-");
        return;
      }
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
      "imgs": jsonEncode(postImages),
      "visibility_async": postVisibility,
    };

    dynamic r = await postWithCSRF(
        widget.isEdit
            ? EndPoints.editPost.endpoint + widget.oldPostData["id"]
            : EndPoints.createPost.endpoint,
        body);

    stopLoadingDialog(context);
    Future.delayed(Duration(milliseconds: 100)).then((value) {
      if (r == "post ${widget.isEdit ? "updated" : "created"}") {
        widget.updateCallBack();
        AutoRouter.of(context).pop().then((value) => showSuccessDialog(context,
            "Successfully ${widget.isEdit ? "updated" : "created"} post!"));
      } else {
        showErrorDialog(context, r);
      }
    });
  }

  Widget _buildTitleSection() {
    return Container(
      width: MediaQuery.of(context).size.width - 50,
      padding: const EdgeInsets.only(left: 5),
      child: TextFormField(
        controller: titleController,
        maxLength: 100,
        onTapOutside: (e) => FocusManager.instance.primaryFocus?.unfocus(),
        decoration: InputDecoration(
          isDense: true,
          contentPadding: const EdgeInsets.fromLTRB(0, 0, 0, 1),
          counterText: "${titleController.text.length}/100",
          hintText: "Title",
          hintStyle: const TextStyle(color: Colors.grey, fontSize: 18),
        ),
        style: const TextStyle(
          fontSize: 18,
        ),
        onChanged: (input) {
          setState(() => titleController = titleController);
        },
      ),
    );
  }

  Widget _buildContentSection() {
    return SizedBox(
        width: MediaQuery.of(context).size.width - 25,
        child: TextFormField(
          controller: contentController,
          maxLength: 2000,
          onTapOutside: (e) => FocusManager.instance.primaryFocus?.unfocus(),
          decoration: InputDecoration(
              border: InputBorder.none,
              contentPadding: const EdgeInsets.only(left: 8),
              counterText: "${contentController.text.length}/2000     ",
              hintText: "Content",
              hintStyle: const TextStyle(color: Colors.grey, fontSize: 14)),
          style: const TextStyle(fontSize: 16),
          maxLines: 11,
          minLines: 10,
          onChanged: (input) {
            setState(() => contentController = contentController);
          },
        ));
  }

  Widget _buildPickImageButton() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: Container(
        color: Color.fromARGB(255, 195, 195, 195),
        height: previewImageWidth - 5,
        width: previewImageWidth - 5,
        alignment: Alignment.center,
        child: IconButton(
            icon: const Icon(
              Icons.add,
              size: 50,
            ),
            onPressed: () async {
              List<XFile?> imgs = await imagePicker.pickMultiImage(
                  maxHeight: 600, maxWidth: 800);
              for (XFile? img in imgs) {
                if (img != null) {
                  if (imageCount >= 9) {
                    showCustomDialog(context, "Too many images",
                        "Please only pick up to 9 images");
                    return;
                  }
                  setImage(imageCount, img);
                }
              }
            }),
      ),
    );
  }

  Widget _buildImageList() {
    return SizedBox(
      width: MediaQuery.of(context).size.width - 30 - previewImageWidth,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: imageCount,
        shrinkWrap: true,
        itemBuilder: (context, imageIndex) {
          return IconButton(
            splashColor: Colors.transparent,
            highlightColor: Colors.transparent,
            padding: const EdgeInsets.only(right: 10),
            onPressed: () {
              AutoRouter.of(context).push(MultiplePhotosViewer(
                  listOfPhotoBytes: postImages,
                  initialIndex: imageIndex,
                  actionFunction: (currIndex) {
                    return [
                      IconButton(
                        onPressed: () {
                          showConfirmationDialog(
                              context, "Are you sure to remove this image?",
                              () {
                            removeImage(currIndex);
                            AutoRouter.of(context).pop();
                          });
                        },
                        icon: const Icon(
                          Icons.delete,
                          color: Colors.red,
                        ),
                      )
                    ];
                  }));
            },
            icon: ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: imagesPreview[imageIndex] ??
                    SizedBox(
                      width: previewImageWidth,
                      height: previewImageWidth,
                    )),
          );
        },
      ),
    );
  }

  Widget _buildImageSection() {
    return SizedBox(
        width: MediaQuery.of(context).size.width - 15,
        height: previewImageWidth,
        child: Row(
          children: [
            const Padding(
              padding: EdgeInsets.only(left: 5),
            ),
            _buildPickImageButton(),
            const Padding(padding: EdgeInsets.only(right: 10)),
            _buildImageList(),
            const Padding(
              padding: EdgeInsets.only(left: 5),
            ),
          ],
        ));
  }

  Widget _buildTagNameSection() {
    return Row(
      children: [
        const Padding(
          padding: EdgeInsets.only(left: 5),
        ),
        // Tag name indicator
        Text(
          " #${widget.tagName}",
          style: const TextStyle(fontSize: 16, color: Colors.pink),
        ),
      ],
    );
  }

  Widget _buildVisibilitySection() {
    return Container(
        height: 30,
        width: MediaQuery.of(context).size.width,
        alignment: Alignment.center,
        child: PopupMenuButton(
          onOpened: toggleVisibilities,
          onCanceled: toggleVisibilities,
          offset: const Offset(-1, -200),
          constraints: const BoxConstraints.expand(width: 190, height: 190),
          child: SizedBox(
              width: 200,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "Visibility: $visibilityButtonText",
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold),
                  ),
                  Transform.rotate(
                    angle: showVisibilites ? pi / 2 : pi / 2 * 3,
                    child: Icon(
                      Icons.arrow_right,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  )
                ],
              )),
          itemBuilder: (context) {
            return List<PopupMenuItem>.generate(visibilityDescriptions.length,
                (index) {
              return PopupMenuItem(
                height: 45,
                child: Container(
                    width: 190,
                    alignment: Alignment.center,
                    child: Text(
                      visibilityDescriptions[index],
                      textAlign: TextAlign.center,
                    )),
                onTap: () => setVisibility(index),
              );
            });
          },
        ));
  }

  @override
  Widget build(BuildContext context) {
    //previewImageWidth = (MediaQuery.of(context).size.width - 140) / 3;
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        titleSpacing: 0,
        title: Text("${widget.isEdit ? "Edit" : "Create"} a post"),
        actions: [
          IconButton(
              onPressed: () {
                FocusManager.instance.primaryFocus?.unfocus();
                showConfirmationDialog(
                    context,
                    "Are you sure to ${widget.isEdit ? "edit" : "create"} this post?",
                    createPost);
              },
              icon: const Icon(Icons.add_task)),
          const Padding(padding: EdgeInsets.only(right: 20))
        ],
      ),
      body: SingleChildScrollView(
          child: Column(children: [
        Padding(
          padding: const EdgeInsets.only(left: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTitleSection(),
              const Padding(padding: EdgeInsets.only(top: 10)),
              _buildContentSection(),
              const Padding(padding: EdgeInsets.only(top: 10)),
              _buildImageSection(),
              const Padding(
                padding: EdgeInsets.only(top: 10),
              ),
              _buildTagNameSection(),
              _buildVisibilitySection()
            ],
          ),
        ),
      ])),
    );
  }
}
