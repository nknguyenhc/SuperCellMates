import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:get_it/get_it.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:supercellmates/config/config.dart';
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
  final GlobalKey checkBoxKey = GlobalKey();

  void setIcon(CroppedFile icon) {
    icon.readAsBytes().then((bytes) {
      if (bytes.length > GetIt.I<Config>().totalUploadLimit) {
        showCustomDialog(
            context,
            "Image too large",
            "Your image is larger than 3MB after compression.\n" +
                "Please try again with smaller images.\n\n" +
                "On behalf of our weak server, we apologise for your inconvenience -_-");
        return "image too large";
      }
    }).then((value) {
      if (value != "image too large") {
        setState(() {
          tagIcon = icon;
        });
      }
    });
  }

  void toggleAttachTag() {
    attachTag = !attachTag;
  }

  Widget _buildTagNameSection() {
    return Row(
      children: [
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
    );
  }

  Widget _buildTagIconSection() {
    return Row(
      children: [
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
                  source: ImageSource.gallery, maxHeight: 600, maxWidth: 800);
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
    );
  }

  Widget _buildDescriptionSection() {
    return Row(
      children: [
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
                  hintStyle: TextStyle(color: Colors.grey, fontSize: 14)),
              style: const TextStyle(fontSize: 14),
              maxLines: 6,
              minLines: 5,
              onChanged: (input) {
                tagDescription = input;
              },
            ))
      ],
    );
  }

  Widget _buildAttachTagCheckbox() {
    return Row(
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
    );
  }

  Widget _buildSubmitButton() {
    return Row(
      children: [
        const Padding(padding: EdgeInsets.all(10)),
        TextButton(
            onPressed: () {
              if (tagName == "") {
                showErrorDialog(context, "Tag name cannot be empty!");
              } else {
                showConfirmationDialog(
                    context, "Are you sure to request for this tag?", () async {
                  startUploadingDialog(context, "data");
                  dynamic body = tagIcon == null
                      ? {
                          "tag": tagName,
                          "description": tagDescription,
                          "attach": attachTag,
                        }
                      : {
                          "tag": tagName,
                          "description": tagDescription,
                          "img": jsonEncode(await tagIcon!.readAsBytes()),
                          "attach": attachTag
                        };
                  dynamic response = await postWithCSRF(
                      EndPoints.addTagRequest.endpoint, body);
                  stopLoadingDialog(context);
                  Future.delayed(Duration(milliseconds: 100)).then((value) {
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
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar:
            AppBar(titleSpacing: 0, title: const Text("Request for a new tag")),
        body: SingleChildScrollView(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
            Padding(
                padding: const EdgeInsets.only(left: 20, top:10),
                child: Column(
                  children: [
                    _buildTagNameSection(),
                    const Padding(padding: EdgeInsets.only(top: 20)),
                    _buildTagIconSection(),
                    const Padding(padding: EdgeInsets.only(top: 20)),
                    _buildDescriptionSection(),
                    const Padding(padding: EdgeInsets.only(top: 10)),
                    _buildAttachTagCheckbox(),
                    const Padding(padding: EdgeInsets.only(top: 10)),
                    _buildSubmitButton(),
                  ],
                ))
          ]),
        ));
  }
}
