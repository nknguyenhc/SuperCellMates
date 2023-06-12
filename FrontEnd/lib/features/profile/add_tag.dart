import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'dart:convert';

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
                tagLimitReached: tagCount >= tagLimit,
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
                        "My tags",
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
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                height: 30,
                alignment: Alignment.bottomCenter,
                child: Text("Tag count limit: ${tagCount}/${tagLimit}",
                style: TextStyle(fontSize: 15),),
              ),
              Container(
                height: 30,
                alignment: Alignment.bottomCenter,
                child: IconButton(
                  onPressed: () => showCustomDialog(
                      context,
                      "Tag count limit",
                      "By limiting the number of tags, we hope you can join communities" +
                          " that you are most passionate about.\n\nBut fret not, you can unlock" + 
                          " a higher limit by completing achievements!"),
                  icon: const Icon(
                    Icons.info,
                    size: 20,
                  ),
                  padding: const EdgeInsets.only(top: 8),
                ),
              ),
            ],
          ),
          SizedBox(
              height: navigationBarIndex == 0
                  ? MediaQuery.of(context).size.height - 160
                  : MediaQuery.of(context).size.height - 190,
              child: dataLoaded
                  ? navigationBarIndex == 0
                      ? TagListView(tagList: myTagsList, isAddTag: false)
                      : searchTagsResult ?? Container()
                  : const CircularProgressIndicator())
        ]));
  }
}
