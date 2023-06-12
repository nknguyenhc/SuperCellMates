import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/rendering.dart';
import 'dart:io';

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
  XFile? tagIcon;
  String tagDescription = "";

  void setIcon(XFile icon) {
    setState(() {
      tagIcon = icon;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                    fontSize: 16,
                  ),
                ),
                const Padding(padding: EdgeInsets.all(11)),
                SizedBox(
                  width: MediaQuery.of(context).size.width - 140,
                  child: TextField(
                    decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: "An accurate name for the tag...",
                        hintStyle: TextStyle(color: Colors.grey, fontSize: 14)),
                    style: const TextStyle(
                      fontSize: 16,
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
                    fontSize: 16,
                  ),
                ),
                const Padding(padding: EdgeInsets.all(10)),
                IconButton(
                    onPressed: () async {
                      XFile? img = await imagePicker.pickImage(
                          source: ImageSource.gallery);
                      if (img != null) {
                        setIcon(img);
                      }
                    },
                    icon: const Icon(Icons.photo_library,
                    size: 35,)),
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
                    fontSize: 16,
                  ),
                ),
                const Padding(padding: EdgeInsets.all(5)),
                SizedBox(
                    width: MediaQuery.of(context).size.width - 140,
                    child: TextField(
                      decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          hintText: "Additional information about the tag...",
                          hintStyle:
                              TextStyle(color: Colors.grey, fontSize: 14)),
                      style: const TextStyle(fontSize: 16),
                      maxLines: 3,
                      onChanged: (input) {
                        tagDescription = input;
                      },
                    ))
              ],
            ),
            const Padding(
              padding: EdgeInsets.all(20),
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
                          dynamic body = tagIcon == null
                              ? {
                                  "tag": tagName,
                                  "description": tagDescription,
                                }
                              : {
                                  "tag": tagName,
                                  "description": tagDescription,
                                  "img": await tagIcon!.readAsBytes(),
                                };
                          dynamic response = await postWithCSRF(
                              EndPoints.addTagRequest.endpoint, body);
                          if (response == "Successfully added tag request") {
                            showSuccessDialog(context,
                                "Your request is sent, our admin will review your request.");
                          } else {
                            showErrorDialog(context, response);
                          }
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
