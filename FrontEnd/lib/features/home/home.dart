import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/features/posts/post_listview.dart';
import 'package:supercellmates/functions/notifications.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

class HomePage extends StatefulWidget {
  const HomePage(
      {Key? key,
      required this.username,
      this.sort,
      this.friendFilter,
      this.tagFilter})
      : super(key: key);

  final String username;
  final String? sort;
  final String? friendFilter;
  final String? tagFilter;

  @override
  State<HomePage> createState() => HomePageState();
}

const int defaultBlockLimit = 5;
const double defaultStartTime = 0;
const double defaultInitialTimestamp = 0;
const double defaultStartIndex = 5;

class HomePageState extends State<HomePage> {
  int blockLimit = defaultBlockLimit;
  List<dynamic> homeFeed = [];
  bool homeFeedLoaded = false;
  bool mayHaveMore = true;
  bool isLoadingMore = true;

  double nextStartTime = defaultStartTime;
  double initialTimeStamp = defaultInitialTimestamp;
  double nextStartMatchingIndex = defaultStartIndex;

  String sort = "time";
  String friendFilter = "0";
  String tagFilter = "0";

  Notifications notifications = GetIt.I<Notifications>();

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

  Future<void> refresh() async {
    homeFeed = [];
    homeFeedLoaded = false;
    mayHaveMore = true;
    isLoadingMore = true;
    nextStartTime = defaultStartTime;
    initialTimeStamp = defaultInitialTimestamp;
    nextStartMatchingIndex = defaultStartIndex;
    getHomeFeed();
  }

  void getHomeFeed() async {
    if (!mayHaveMore) {
      return;
    }
    notifications.update();
    setState(() {
      isLoadingMore = true;
    });

    dynamic query = {
      "sort": sort,
      "friend_filter": friendFilter,
      "tag_filter": tagFilter,
      "limit": blockLimit,
    };

    if (sort == "time") {
      initialTimeStamp = defaultInitialTimestamp;
      nextStartMatchingIndex = defaultStartIndex;
      query["start_timestamp"] = nextStartTime;
    } else {
      nextStartTime = defaultStartTime;
      query["initial_timestamp"] = initialTimeStamp;
      query["start_index"] = nextStartMatchingIndex;
    }

    dynamic homeFeedResponseJson =
        await getRequest(EndPoints.getHomeFeed.endpoint, query);
    if (homeFeedResponseJson == "Connection error") {
      showErrorDialog(context, homeFeedResponseJson);
      return;
    }
    dynamic homeFeedResponse = jsonDecode(homeFeedResponseJson);
    if (sort == "time") {
      nextStartTime = homeFeedResponse["stop_timestamp"].toDouble();
    } else {
      initialTimeStamp = homeFeedResponse["initial_timestamp"].toDouble();
      nextStartMatchingIndex = homeFeedResponse["stop_index"].toDouble();
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
                      isInSomeProfile: false,
                      username: widget.username,
                      updateCallBack: refresh,
                      refreshable: true,
                      scrollAtTopEvent: refresh,
                      scrollAtBottomEvent: getHomeFeed,
                    ),
                    isLoadingMore
                        ? const Positioned(
                            bottom: 5, child: CircularProgressIndicator())
                        : Container()
                  ],
                )
              : Container(
                  alignment: Alignment.center,
                  child: const CircularProgressIndicator(),
                )),
    );
  }
}
