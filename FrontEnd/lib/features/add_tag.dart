import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'dart:convert';

import '../functions/get_request.dart';
import '../functions/post_with_csrf.dart';

@RoutePage()
class AddTagPage extends StatefulWidget {
  const AddTagPage({Key? key}) : super(key: key);

  @override
  State<AddTagPage> createState() => AddTagPageState();
}

class AddTagPageState extends State<AddTagPage> {
  final String getURI = "http://10.0.2.2:8000/async";
  final String obtainTagsURI = "http://10.0.2.2:8000/profile/obtain_tags";
  final String addTagsURI = "http://10.0.2.2:8000/profile/add_tags";

  bool dataLoaded = false;

  @override
  void initState() {
    dataLoaded = false;
    super.initState();
    obtainAllTagsList();
  }

  dynamic allTagsList;

  void obtainAllTagsList() async {
    allTagsList = jsonDecode(await getRequest(obtainTagsURI))["tags"];
    setState(() {
      dataLoaded = true;
    });
  }

  // currently only supports adding one tag at a time
  void addTags(dynamic indexes) async {
    var listToAdd =
        indexes.map((index) => allTagsList[index]["tag_id"]).toList();
    var body = {
      "tags": listToAdd,
    };
    var response = jsonDecode(await postWithCSRF(getURI, addTagsURI, body));
    if (response["message"] == "success") {
      print("success!");
    }
  }

  @override
  Widget build(BuildContext context) {
    return dataLoaded
        ? Scaffold(
            appBar: AppBar(title: const Text("AddTag page header")),
            body: Container(
                height: 300,
                width: 100,
                alignment: Alignment.center,
                child: ListView.builder(
                    itemCount: allTagsList != null ? allTagsList.length : 0,
                    itemBuilder: (BuildContext context, int index) {
                      return TextButton(
                          onPressed: () => addTags([index]),
                          child: Text(allTagsList[index]["tag_name"]));
                    })),
          )
        : const CircularProgressIndicator();
  }
}
