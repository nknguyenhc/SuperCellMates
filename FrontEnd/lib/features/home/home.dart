import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:supercellmates/features/posts/post_listview.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  State<HomePage> createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  int blockLimit = 2;
  //int blockCount = 0;
  List<dynamic> homeFeed = [];
  bool homeFeedLoaded = false;
  bool mayHaveMore = true;
  String nextStartID = "";

  @override
  void initState() {
    super.initState();
    getHomeFeed();
  }

  void getHomeFeed() async {
    if (!mayHaveMore) {
      return;
    }
    dynamic query = {
      "sort": "time",
      "friend_filter": 0,
      "tag_filter": 0,
      "start_id": nextStartID,
      "limit": blockLimit,
    };
    dynamic homeFeedResponse =
        jsonDecode(await getRequest(EndPoints.getHomeFeed.endpoint, query));
    nextStartID = homeFeedResponse["stop_id"];
    if (homeFeedResponse["posts"].length == 0) {
      mayHaveMore = false;
      return;
    }

    setState(() {
      homeFeed.addAll(homeFeedResponse["posts"]);
      homeFeedLoaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      child: SizedBox(
          width: MediaQuery.of(context).size.width,
          height: MediaQuery.of(context).size.height - 100,
          child: homeFeedLoaded
              ? PostListView(
                  postList: homeFeed,
                  isInProfile: false,
                  isMyPost: false,
                  updateCallBack: () {},
                  scrollAtTopEvent: () {},
                  scrollAtBottomEvent: getHomeFeed,
                )
              : const CircularProgressIndicator()),
    );
  }
}
