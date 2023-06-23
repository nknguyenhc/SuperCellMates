import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:supercellmates/features/posts/post_listview.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key, this.sort, this.friendFilter, this.tagFilter})
      : super(key: key);

  final String? sort;
  final String? friendFilter;
  final String? tagFilter;

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

  String sort = "time";
  String friendFilter = "0";
  String tagFilter = "0";

  @override
  void initState() {
    super.initState();
    if (widget.sort != null) {
      sort = widget.sort!;
    }
    if (widget.friendFilter != null) {
      friendFilter = widget.friendFilter!;
    }
    if (widget.tagFilter != null) {
      tagFilter = widget.tagFilter!;
    }
    getHomeFeed();
  }

  void getHomeFeed() async {
    if (!mayHaveMore) {
      return;
    }
    dynamic query = {
      "sort": sort,
      "friend_filter": friendFilter,
      "tag_filter": tagFilter,
      "start_id": nextStartID,
      "limit": blockLimit,
    };
    dynamic homeFeedResponse =
        jsonDecode(await getRequest(EndPoints.getHomeFeed.endpoint, query));
    nextStartID = homeFeedResponse["stop_id"];

    setState(() {
      homeFeed.addAll(homeFeedResponse["posts"]);
      homeFeedLoaded = true;
    });

    if (homeFeedResponse["posts"].length == 0) {
      mayHaveMore = false;
      return;
    }
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
