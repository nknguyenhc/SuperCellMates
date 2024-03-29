import 'dart:typed_data';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

class TagListView extends StatefulWidget {
  const TagListView({
    Key? key,
    required this.tagList,
    required this.isAddTag,
    this.tagLimitReached,
    this.onAddCallBack,
    this.canRemoveTag,
  }) : super(key: key);

  final dynamic tagList;
  final bool isAddTag;
  final bool? tagLimitReached;
  final dynamic onAddCallBack;
  final bool? canRemoveTag;

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
    tagIcons =
        List<Uint8List?>.filled(count, Uint8List.fromList([]), growable: true);
    for (int i = 0; i < count; i++) {
      loadImage(i);
    }
  }

  void loadImage(index) async {
    tagIcons[index] = await getRawImageData(widget.tagList[index]["icon"], false);
    setState(() {
      dataLoaded[index] = true;
    });
  }

  void _addTags(dynamic names) async {
    startUploadingDialog(context, "data");
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
    stopLoadingDialog(context);
    Future.delayed(Duration(milliseconds: 100)).then((value) {
      if (response == "success") {
        widget.onAddCallBack();
        showSuccessDialog(context, "Successfully added tag!");
      } else {
        showErrorDialog(context, response);
      }
    });
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
      "Are you sure to add $tagListString?\n\nNote that if you delete a tag, you will not be allowed to remove any more tag for 7 days.",
      () => _addTags(namesToAdd),
    );
  }

  void _removeTag(int index) async {
    startUploadingDialog(context, "data");
    var body = {"tag": widget.tagList[index]["name"]};
    var response = await postWithCSRF(EndPoints.removeTag.endpoint, body);
    stopLoadingDialog(context);
    Future.delayed(Duration(milliseconds: 100)).then((value) {
      if (response == "tag removed") {
        widget.onAddCallBack();
        showSuccessDialog(context,
            "Successfully removed tag, and you cannot remove any more tag for 7 days.\n\nYou can help maintain high-quality communities by choosing tags which you are most passionate about!");
      } else {
        showErrorDialog(context, response);
      }
    });
  }

  void _requestConfirmationForRemovingTag(int index) {
    showConfirmationDialog(
        context,
        "Are you sure to remove ${widget.tagList[index]["name"]}?\n\nThis action is irreversible, and you will not be allowed to remove any more tag for 7 days.",
        () => _removeTag(index));
  }

  Widget tagDivider = const Divider(
    height: 1,
    thickness: 2,
    color: Colors.black12,
    indent: 10,
    endIndent: 10,
  );

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
                        width: widget.isAddTag
                            ? MediaQuery.of(context).size.width - 150
                            : MediaQuery.of(context).size.width - 135,
                        child: Text(
                          name,
                          style: const TextStyle(
                              color: Colors.black, fontSize: 15),
                        ),
                      ),
                    ],
                  ),
                  !widget.isAddTag &&
                          widget.canRemoveTag != null &&
                          widget.canRemoveTag!
                      ? IconButton(
                          onPressed: () {
                            _requestConfirmationForRemovingTag(index);
                          },
                          icon: const Icon(
                            Icons.cancel,
                            color: Colors.red,
                          ))
                      : Container(),
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
              tagDivider
            ],
          );
        });
    return count > 0 && (widget.isAddTag && count <= 20 || !widget.isAddTag)
        ? list // mytags page & at least a tag, OR, addtags page and 1-20 tags
        : widget.isAddTag
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    count == 0
                        ? "No results for this search"
                        : "Please be more specific in your search",
                    textAlign: TextAlign.center,
                  )
                ],
              )
            : const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "No tags yet.\n\nClick on \"Add new tags\" to search for tags!",
                    textAlign: TextAlign.center,
                  ),
                  Padding(padding: EdgeInsets.only(bottom: 80))
                ],
              );
  }
}
