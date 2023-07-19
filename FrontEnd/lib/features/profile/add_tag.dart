import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'dart:convert';

import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/features/profile/search_tag_appbar.dart';
import 'package:supercellmates/features/profile/tag_listview.dart';
import 'package:supercellmates/router/router.gr.dart';

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
  bool canRemoveTag = false;
  int navigationBarIndex = 0;
  Widget? searchTagsResult = const Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Text(
        "Use the search button above to find tags!",
        textAlign: TextAlign.center,
      ),
      Padding(padding: EdgeInsets.only(bottom: 80))
    ],
  );

  @override
  void initState() {
    super.initState();
    obtainMyTagsList();
  }

  void obtainMyTagsList() async {
    dataLoaded = false;
    dynamic responseJson =
        await getRequest(EndPoints.obtainTags.endpoint, null);
    if (responseJson == "Connection error") {
      showErrorDialog(context, responseJson);
      return;
    }
    dynamic response = jsonDecode(responseJson);
    myTagsList = response["tags"];
    setState(() {
      tagLimit = response["tag_count_limit"];
      tagCount = myTagsList.length;
    });
    dynamic canRemoveTagResponse =
        await getRequest(EndPoints.canRemoveTag.endpoint, null);
    if (canRemoveTagResponse == "true") {
      setState(() => canRemoveTag = true);
    } else if (canRemoveTagResponse == "false") {
      setState(() => canRemoveTag = false);
    } else {
      showErrorDialog(context, canRemoveTagResponse);
      return;
    }
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
                onAddCallBack: () {
                  navigate(0);
                  widget.updateCallBack();
                }),
        body: Column(children: [
          NavigationBar(
            height: 55,
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
                child: Text(
                  "Tag count limit: $tagCount/$tagLimit",
                  style: const TextStyle(fontSize: 15),
                ),
              ),
              Container(
                height: 30,
                alignment: Alignment.bottomCenter,
                child: IconButton(
                  onPressed: () => showCustomDialog(
                      context,
                      "Tag count limit",
                      "By limiting the number of tags, we hope you can join communities"
                          " which you are most passionate about.\n\nBut fret not, you can unlock"
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
                  ? MediaQuery.of(context).size.height - 170
                  : MediaQuery.of(context).size.height - 220,
              child: dataLoaded
                  ? navigationBarIndex == 0
                      ? TagListView(
                          tagList: myTagsList,
                          isAddTag: false,
                          canRemoveTag: canRemoveTag,
                          onAddCallBack: () {
                            obtainMyTagsList();
                            widget.updateCallBack();
                          },
                        )
                      : searchTagsResult
                  : Container(
                      alignment: Alignment.center,
                      child: const CircularProgressIndicator(),
                    )),
          navigationBarIndex == 1
              ? Container(
                  alignment: Alignment.topCenter,
                  height: 40,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Text(
                        "Can't find the tag you want?",
                        style: TextStyle(fontSize: 14),
                      ),
                      TextButton(
                        style: const ButtonStyle(
                            padding: MaterialStatePropertyAll(
                                EdgeInsets.only(left: 2))),
                        onPressed: () {
                          AutoRouter.of(context).push(const RequestTagRoute());
                        },
                        child: const Text(
                          "Request here",
                          style: TextStyle(
                              decoration: TextDecoration.underline,
                              fontSize: 14),
                        ),
                      )
                    ],
                  ))
              : Container()
        ]));
  }
}
