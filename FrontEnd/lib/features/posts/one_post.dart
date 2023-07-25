import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/features/posts/post_listview.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

@RoutePage()
class OnePostPage extends StatefulWidget {
  const OnePostPage({Key? key, required this.postID, required this.username})
      : super(key: key);

  final String postID;
  final String username;

  @override
  State<OnePostPage> createState() => OnePostPageState();
}

class OnePostPageState extends State<OnePostPage> {
  Future? loadPostFuture;

  @override
  void initState() {
    super.initState();
    loadPost();
  }

  void loadPost() {
    setState(() {
      loadPostFuture =
          getRequest(EndPoints.getPost.endpoint + widget.postID, null);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            titleSpacing: 0,
            title: const Text(
              "View post detail",
              style: const TextStyle(fontSize: 20),
            )),
        body: SingleChildScrollView(
            child: FutureBuilder(
                future: loadPostFuture,
                builder: (context, snapshot) {
                  return snapshot.hasError || snapshot.data == ""
                      ? Container(
                          alignment: Alignment.center,
                          width: MediaQuery.of(context).size.width,
                          height: MediaQuery.of(context).size.height - 80,
                          child: const Text(
                            "An error has occurred.\n\nThis post has probably been deleted.",
                            textAlign: TextAlign.center,
                          ),
                        )
                      : snapshot.hasData
                          ? SizedBox(
                              width: MediaQuery.of(context).size.width,
                              height: MediaQuery.of(context).size.height - 80,
                              child: PostListView(
                                  postList: [jsonDecode(snapshot.data)],
                                  username: widget.username,
                                  isInSomeProfile: false,
                                  updateCallBack: loadPost,
                                  refreshable: false,
                                  scrollAtTopEvent: () {},
                                  scrollAtBottomEvent: () {}))
                          : Container(
                              alignment: Alignment.center,
                              width: MediaQuery.of(context).size.width,
                              height: MediaQuery.of(context).size.height - 80,
                              child: const CircularProgressIndicator(),
                            );
                })));
  }
}
