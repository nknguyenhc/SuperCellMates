import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:supercellmates/features/custom_checkbox.dart';
import 'dart:io';

import 'package:supercellmates/functions/crop_image.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:image_picker/image_picker.dart';

@RoutePage()
class RequestTagPage extends StatefulWidget {
  const RequestTagPage({Key? key}) : super(key: key);

  @override
  State<RequestTagPage> createState() => RequestTagPageState();
}

class RequestTagPageState extends State<RequestTagPage> {
  ImagePicker imagePicker = ImagePicker();
  String tagName = "";
  CroppedFile? tagIcon;
  String tagDescription = "";
  bool attachTag = CustomCheckbox.ischecked;

  void setIcon(CroppedFile icon) {
    setState(() {
      tagIcon = icon;
    });
  }

  void toggleAttachTag() {
    attachTag = !attachTag;
  }

  @override
  Widget build(BuildContext context) {
    final GlobalKey checkBoxKey = GlobalKey();

    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar:
            AppBar(titleSpacing: 0, title: const Text("Request for a new tag")),
        body: Container(
          alignment: Alignment.center,
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
            const Padding(
              padding: EdgeInsets.all(10),
            ),
            Row(
              children: [
                const Padding(padding: EdgeInsets.all(10)),
                const Text(
                  "Tag name:",
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                const Padding(padding: EdgeInsets.all(11)),
                SizedBox(
                  width: MediaQuery.of(context).size.width - 140,
                  child: TextField(
                    maxLength: 25,
                    decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: "An accurate name...",
                        hintStyle: TextStyle(color: Colors.grey, fontSize: 14)),
                    style: const TextStyle(
                      fontSize: 14,
                    ),
                    onChanged: (input) {
                      tagName = input;
                    },
                  ),
                )
              ],
            ),
            const Padding(
              padding: EdgeInsets.all(20),
            ),
            Row(
              children: [
                const Padding(padding: EdgeInsets.all(10)),
                const Text(
                  "Tag icon:",
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                const Padding(padding: EdgeInsets.all(10)),
                IconButton(
                    onPressed: () async {
                      XFile? img = await imagePicker.pickImage(
                          source: ImageSource.gallery,
                          maxHeight: 600,
                          maxWidth: 800);
                      if (img == null) return;
                      CroppedFile? croppedImg = await cropSquaredImage(img);
                      if (croppedImg != null) {
                        setIcon(croppedImg);
                      }
                    },
                    icon: const Icon(
                      Icons.photo_library,
                      size: 35,
                    )),
                const Padding(padding: EdgeInsets.all(10)),
                tagIcon == null
                    ? Container()
                    : Image.file(
                        File(tagIcon!.path),
                        width: 70,
                        height: 70,
                      ),
              ],
            ),
            const Padding(
              padding: EdgeInsets.all(20),
            ),
            Row(
              children: [
                const Padding(padding: EdgeInsets.all(10)),
                const Text(
                  "Description:",
                  style: TextStyle(
                    fontSize: 14,
                  ),
                ),
                const Padding(padding: EdgeInsets.all(5)),
                SizedBox(
                    width: MediaQuery.of(context).size.width - 140,
                    child: TextField(
                      maxLength: 200,
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          hintText: "Additional information about the tag...",
                          hintStyle:
                              TextStyle(color: Colors.grey, fontSize: 14)),
                      style: const TextStyle(fontSize: 14),
                      maxLines: 5,
                      onChanged: (input) {
                        tagDescription = input;
                      },
                    ))
              ],
            ),
            const Padding(
              padding: EdgeInsets.all(5),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CustomCheckbox(
                  key: checkBoxKey,
                  togglePACheckedFunction: toggleAttachTag,
                  tickColor: Colors.white,
                  boxColor: Colors.black,
                ),
                TextButton(
                    style: const ButtonStyle(
                        padding: MaterialStatePropertyAll(EdgeInsets.zero)),
                    onPressed: () {
                      dynamic state = checkBoxKey.currentState;
                      setState(() {
                        state.toggle();
                      });
                    },
                    child: Text("If approved, attach tag to my profile",
                        style: TextStyle(
                          color: Colors.black,
                        )))
              ],
            ),
            const Padding(
              padding: EdgeInsets.all(5),
            ),
            Row(
              children: [
                const Padding(padding: EdgeInsets.all(10)),
                TextButton(
                    onPressed: () {
                      if (tagName == "") {
                        showErrorDialog(context, "Tag name cannot be empty!");
                      } else {
                        showConfirmationDialog(
                            context, "Are you sure to request for this tag?",
                            () async {
                          startUploadingDialog(context, "data");
                          print(attachTag);
                          dynamic body = tagIcon == null
                              ? {
                                  "tag": tagName,
                                  "description": tagDescription,
                                  "attach": attachTag,
                                }
                              : {
                                  "tag": tagName,
                                  "description": tagDescription,
                                  "img":
                                      jsonEncode(await tagIcon!.readAsBytes()),
                                  "attach": attachTag
                                };
                          dynamic response = await postWithCSRF(
                              EndPoints.addTagRequest.endpoint, body);
                          stopLoadingDialog(context);
                          Future.delayed(Duration(milliseconds: 100))
                              .then((value) {
                            if (response == "Successfully added tag request") {
                              showSuccessDialog(context,
                                  "Your request is sent, our admin will review your request.");
                            } else {
                              showErrorDialog(context, response);
                            }
                          });
                        });
                      }
                    },
                    style: const ButtonStyle(
                        backgroundColor: MaterialStatePropertyAll(Colors.blue)),
                    child: const Text(
                      "Submit",
                      style: TextStyle(color: Colors.white),
                    ))
              ],
            )
          ]),
        ));
  }
}
