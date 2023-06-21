import 'dart:typed_data';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

class TagListView extends StatefulWidget {
  const TagListView(
      {Key? key,
      required this.tagList,
      required this.isAddTag,
      this.tagLimitReached,
      this.onAddCallBack})
      : super(key: key);

  final dynamic tagList;
  final bool isAddTag;
  final bool? tagLimitReached;
  final dynamic onAddCallBack;

  @override
  State<TagListView> createState() => TagListViewState();
}

class TagListViewState extends State<TagListView> {
  int count = 0;
  var dataLoaded = [];
  var tagIcons = [];

  @override
  void initState() {
    super.initState();
    count = widget.tagList.length;
    dataLoaded = List<bool>.filled(count, false, growable: true);
    tagIcons = List<Uint8List?>.filled(count, Uint8List.fromList([]), growable: true);
    for (int i = 0; i < count; i++) {
      loadImage(i);
    }
  }

  void loadImage(index) async {
    tagIcons[index] = await getRawImageData(widget.tagList[index]["icon"]);
    setState(() {
      dataLoaded[index] = true;
    });
  }

  void _addTags(dynamic names) async {
    String listToAddString = "";
    // currently only supports adding one tag
    // backend implementation needs to be changed if want multiple
    // for (int i = 0; i < names.length - 1; i++) {
    //   listToAddString += "'${names[i]}', ";
    // }
    listToAddString += "${names[names.length - 1]}";
    var body = {
      "tags": listToAddString,
      "count": names.length,
    };
    var response = await postWithCSRF(EndPoints.addTags.endpoint, body);
    if (response == "success") {
      widget.onAddCallBack();
      showSuccessDialog(context, "Successfully added tag!");
    }
  }

  void _requestConfirmationForTag(dynamic indexes) {
    if (widget.tagLimitReached!) {
      showCustomDialog(context, "Tag count limit reached",
          "oops, you can't add more tags... for now.\n\nLevel up to claim more tags!");
      return;
    }

    var namesToAdd =
        indexes.map((index) => widget.tagList[index]["name"]).toList();
    String tagListString = namesToAdd[0];
    for (int i = 1; i < namesToAdd.length; i++) {
      namesToAdd += ", ${namesToAdd[i]}";
    }

    showConfirmationDialog(
      context,
      "Are you sure to add $tagListString?\nTags cannot be dropped once claimed.",
      () => _addTags(namesToAdd),
    );
  }

  @override
  Widget build(BuildContext context) {
    ListView list = ListView.builder(
        itemCount: count,
        itemBuilder: (context, index) {
          String name = widget.tagList[index]["name"];
          return Column(
            children: [
              TextButton(
                onPressed: () async {
                  FocusManager.instance.primaryFocus?.unfocus();
                  // TODO: show description
                },
                child: Row(children: [
                  SizedBox(
                    height: 50,
                    width: 50,
                    child: dataLoaded[index]
                        ? IconButton(
                            onPressed: () {
                              AutoRouter.of(context).push(SinglePhotoViewer(
                                  photoBytes: tagIcons[index], actions: []));
                            },
                            icon: Image.memory(tagIcons[index]),
                            iconSize: 50,
                            padding: EdgeInsets.zero,
                          )
                        : const CircularProgressIndicator(),
                  ),
                  const Padding(padding: EdgeInsets.all(6)),
                  Column(
                    children: [
                      const Padding(padding: EdgeInsets.only(left: 2)),
                      SizedBox(
                        width: MediaQuery.of(context).size.width - 150,
                        child: Text(
                          name,
                          style: const TextStyle(
                              color: Colors.black, fontSize: 17),
                        ),
                      ),
                    ],
                  ),
                  widget.isAddTag
                      ? TextButton(
                          onPressed: () {
                            _requestConfirmationForTag([index]);
                          },
                          style: const ButtonStyle(
                              backgroundColor:
                                  MaterialStatePropertyAll(Colors.blue)),
                          child: const Text(
                            "Add",
                            style: TextStyle(color: Colors.white),
                          ))
                      : Container(),
                ]),
              ),
              const Divider(
                height: 1,
                color: Colors.grey,
                indent: 10,
                endIndent: 10,
              )
            ],
          );
        });
    return list;
  }
}
