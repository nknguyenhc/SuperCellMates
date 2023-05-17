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
  final String obtainTagsURI = "http://10.0.2.2:8000/profile/obtain_tags";

  @override
  void initState() {
    super.initState();
  }

  dynamic allTagsList;

  void obtainAllTagsList() async {
    allTagsList = jsonDecode(await getRequest(obtainTagsURI));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("AddTag page header")),
      body: Container(
          height: 300,
          width: 100,
          alignment: Alignment.center,
          child: ListView.builder(
              itemCount: allTagsList != null ? allTagsList.length : 0,
              itemBuilder: (BuildContext context, int index) {
                return TextButton(
                    onPressed: () => {}, child: allTagsList[index]["tag_name"]);
              })),
    );
  }
}
