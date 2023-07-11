import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:supercellmates/features/dialogs.dart';
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
  int blockLimit = 5;
  List<dynamic> homeFeed = [];
  bool homeFeedLoaded = false;
  bool mayHaveMore = true;
  bool isLoadingMore = true;
  String nextStartTime = "";
  String nextStartID = "";
  String nextStartMatchingIndex = "5";

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
    setState(() {
      isLoadingMore = true;
    });

    dynamic query = {
      "sort": sort,
      "friend_filter": friendFilter,
      "tag_filter": tagFilter,
      "limit": blockLimit,
      "start_id": nextStartID,
    };

    if (sort == "time") {
      if (nextStartTime == "") {
        // changed from another sorting method
        nextStartID = "";
      }
      nextStartMatchingIndex = "5";
      query["start_datetime"] = nextStartTime;
    } else {
      if (nextStartMatchingIndex == "") {
        // changed from another sorting method
        nextStartID = "";
      }
      nextStartTime = "";
      query["start_matching_index"] = nextStartMatchingIndex;
    }

    dynamic homeFeedResponseJson =
        await getRequest(EndPoints.getHomeFeed.endpoint, query);
    if (homeFeedResponseJson == "Connection error") {
      showErrorDialog(context, homeFeedResponseJson);
      return;
    }
    dynamic homeFeedResponse = jsonDecode(homeFeedResponseJson);
    nextStartID = homeFeedResponse["stop_id"];
    if (sort == "time") {
      nextStartTime = homeFeedResponse["stop_datetime"];
    } else {
      nextStartMatchingIndex = homeFeedResponse["stop_matching_index"];
    }

    setState(() {
      homeFeed.addAll(homeFeedResponse["posts"]);
      isLoadingMore = false;
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
              ? Stack(
                  alignment: Alignment.center,
                  children: [
                    PostListView(
                      postList: homeFeed,
                      isInProfile: false,
                      isMyPost: false,
                      updateCallBack: () {},
                      scrollAtTopEvent: () {},
                      scrollAtBottomEvent: getHomeFeed,
                    ),
                    isLoadingMore
                        ? const Positioned(
                            bottom: 5, child: CircularProgressIndicator())
                        : Container()
                  ],
                )
              : const CircularProgressIndicator()),
    );
  }
}
