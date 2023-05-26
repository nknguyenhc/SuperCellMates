import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'dart:convert';

import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

@RoutePage()
class AddTagPage extends StatefulWidget {
  const AddTagPage({Key? key, required this.updateCallBack}) : super(key: key);

  final dynamic updateCallBack;

  @override
  State<AddTagPage> createState() => AddTagPageState();
}

class AddTagPageState extends State<AddTagPage> {
  bool dataLoaded = false;

  @override
  void initState() {
    dataLoaded = false;
    super.initState();
    obtainAllTagsList();
  }

  dynamic allTagsList;

  void obtainAllTagsList() async {
    dataLoaded = false;
    allTagsList =
        jsonDecode(await getRequest(EndPoints.obtainTags.endpoint, null))["tags"];
    setState(() {
      dataLoaded = true;
    });
  }

  // currently only supports adding one tag at a time
  void _addTags(dynamic indexes) async {
    var listToAdd =
        indexes.map((index) => allTagsList[index]["tag_id"]).toList();
    var body = {
      "tags": listToAdd,
      "count": listToAdd.length,
    };
    var response = await postWithCSRF(EndPoints.addTags.endpoint, body);
    if (response == "success") {
      obtainAllTagsList();
      widget.updateCallBack();
      showSuccessDialog(context, "Successfully added tag!");
    }
  }

  void _requestConfirmationForTag(dynamic indexes) {
    var namesToAdd =
        indexes.map((index) => allTagsList[index]["tag_name"]).toList();
    String tagListString = namesToAdd[0];
    for (int i = 1; i < namesToAdd.length; i++) {
      namesToAdd += ", ${namesToAdd[i]}";
    }

    showConfirmationDialog(
      context,
      "Are you sure to add $tagListString?",
      () => _addTags(indexes),
    );
  }

  @override
  Widget build(BuildContext context) {
    return dataLoaded
        ? Scaffold(
            appBar: AppBar(title: const Text("AddTag page header")),
            body: Container(
                height: 700,
                width: 100,
                alignment: Alignment.center,
                child: ListView.builder(
                    itemCount: allTagsList != null ? allTagsList.length : 0,
                    itemBuilder: (BuildContext context, int index) {
                      return allTagsList[index]["in"]
                          ? TextButton(
                              onPressed: () => {},
                              child: Text(
                                allTagsList[index]["tag_name"],
                                style: const TextStyle(color: Colors.grey),
                              ),
                            )
                          : TextButton(
                              onPressed: () =>
                                  _requestConfirmationForTag([index]),
                              child: Text(allTagsList[index]["tag_name"]));
                    })),
          )
        : const CircularProgressIndicator();
  }
}
