import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'dart:convert';

import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

@RoutePage()
class AddTagPage extends StatefulWidget {
  const AddTagPage({Key? key}) : super(key: key);

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
    allTagsList = jsonDecode(await getRequest(EndPoints.obtainTags.endpoint))["tags"];
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
    var response = jsonDecode(await postWithCSRF(EndPoints.addTags.endpoint, body));
    if (response["message"] == "success") {
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
                      return allTagsList[index]["in"]
                          ? TextButton(
                              onPressed: () => {},
                              child: Text(
                                allTagsList[index]["tag_name"],
                                style: const TextStyle(color: Colors.grey),
                              ),
                            )
                          : TextButton(
                              onPressed: () => addTags([index]),
                              child: Text(allTagsList[index]["tag_name"]));
                    })),
          )
        : const CircularProgressIndicator();
  }
}
