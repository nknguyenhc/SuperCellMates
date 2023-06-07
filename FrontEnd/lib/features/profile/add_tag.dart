import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'dart:convert';
import 'dart:async';

import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/features/profile/search_tag_appbar.dart';
import 'package:supercellmates/features/profile/tag_listview.dart';

@RoutePage()
class AddTagPage extends StatefulWidget {
  const AddTagPage({Key? key, required this.updateCallBack}) : super(key: key);

  final dynamic updateCallBack;

  @override
  State<AddTagPage> createState() => AddTagPageState();
}

class AddTagPageState extends State<AddTagPage> {
  var myTagsList = [];
  bool dataLoaded = false;
  var tagCount = 0;
  var tagLimit = 0;
  int navigationBarIndex = 0;
  Timer? _searchTimer;
  Widget? searchTagsResult = Container();

  @override
  void initState() {
    super.initState();
    obtainMyTagsList();
  }

  void obtainMyTagsList() async {
    dataLoaded = false;
    dynamic response =
        jsonDecode(await getRequest(EndPoints.obtainTags.endpoint, null));
    myTagsList = response["tags"];
    setState(() {
      tagLimit = response["tag_count_limit"];
      tagCount = myTagsList.length;
    });
    dataLoaded = true;
  }

  // currently only supports adding one tag at a time

  void navigate(int index) {
    if (navigationBarIndex != index) {
      if (index == 0) {
        obtainMyTagsList();
        updateSearchTagsResult(Container());
      } else {
        obtainMyTagsList();
      }
      setState(() {
        navigationBarIndex = index;
      });
    }
  }

  void updateSearchTagsResult(Widget result) {
    setState(() {
      searchTagsResult = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: navigationBarIndex == 0
            ? AppBar(titleSpacing: 18, title: const Text("Manage my tags"))
            : SearchTagAppBar(
                updateCallBack: updateSearchTagsResult,
                onAddCallBack: () => navigate(0)),
        body: Column(children: [
          NavigationBar(
            height: 50,
            destinations: [
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 40,
                    child: TextButton(
                      onPressed: () {
                        navigate(0);
                      },
                      child: Text(
                        "My Tags",
                        style: TextStyle(
                            fontSize: 18,
                            color: navigationBarIndex == 0
                                ? Colors.blue
                                : Colors.blueGrey),
                      ),
                    ),
                  ),
                ],
              ),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    height: 40,
                    child: TextButton(
                      onPressed: () {
                        navigate(1);
                      },
                      child: Text("Add new tags",
                          style: TextStyle(
                              fontSize: 18,
                              color: navigationBarIndex == 1
                                  ? Colors.blue
                                  : Colors.blueGrey)),
                    ),
                  ),
                ],
              )
            ],
            selectedIndex: navigationBarIndex,
            shadowColor: Colors.grey,
          ),
          SizedBox(
              height: navigationBarIndex == 0
                  ? MediaQuery.of(context).size.height - 140
                  : MediaQuery.of(context).size.height - 170,
              child: dataLoaded
                  ? navigationBarIndex == 0
                      ? TagListView(tagList: myTagsList, isAddTag: false)
                      : searchTagsResult ?? Container()
                  : const CircularProgressIndicator())
        ]));
  }
}
