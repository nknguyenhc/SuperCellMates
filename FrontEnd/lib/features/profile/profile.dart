import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import 'package:supercellmates/http_requests/get_image.dart';
import 'package:supercellmates/router/router.gr.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage(
      {Key? key, required this.data, required this.updateCallBack})
      : super(key: key);

  final dynamic updateCallBack;

  final dynamic data;

  @override
  State<ProfilePage> createState() => ProfilePageState();
}

class ProfilePageState extends State<ProfilePage> {
  int tagListCount = 0;
  var dataLoaded = [];
  var tagIcons = [];

  @override
  void initState() {
    super.initState();
    tagListCount = widget.data["tags"].length;
    dataLoaded = List<bool>.filled(tagListCount, false, growable: true);
    tagIcons = List<Image?>.filled(tagListCount, null, growable: true);
    for (int i = 0; i < tagListCount; i++) {
      loadTagIcon(i);
    }
  }

  void loadTagIcon(index) async {
    tagIcons[index] =
        await getImage(widget.data["tags"][index]["icon"]);
    setState(() {
      dataLoaded[index] = true;
    });
  }


  @override
  Widget build(BuildContext context) {
    var tagList = widget.data["tags"];
    double myPostsHeight = MediaQuery.of(context).size.height;
    myPostsHeight -= 80; // appbar height
    myPostsHeight -= 60; // taglist height
    myPostsHeight -= 10; // divider height
    myPostsHeight -= 66; // createPost height
    myPostsHeight -= 82; // bottom navigation bar height
    myPostsHeight -= 30; // buffer

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          height: 60,
          child: Flex(direction: Axis.horizontal, children: [
            Expanded(
              child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: tagList.length + 1,
                  scrollDirection: Axis.horizontal,
                  itemBuilder: (BuildContext context, int index) {
                    return index < tagList.length
                        ? tagList[index] == ""
                            ? Container()
                            : IconButton(
                              onPressed: () => {}, 
                              icon: dataLoaded[index]
                                ? tagIcons[index]
                                : const CircularProgressIndicator())
                        : IconButton(
                            onPressed: () => AutoRouter.of(context).push(
                                AddTagRoute(
                                    updateCallBack: widget.updateCallBack)),
                            icon: const Icon(Icons.add_circle_outline_rounded),
                            iconSize: 50,
                          );
                  }),
            )
          ]),
        ),
        const Divider(
          height: 10,
          color: Colors.grey,
          indent: 15,
          endIndent: 15,
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              icon: const Icon(Icons.note_add, size: 50),
              onPressed: () {
                AutoRouter.of(context).push(const CreatePostRoute());
              },
            )
          ],
        ),
        // TODO: Change to Posts class
        // The Posts should return a column whose width is full width of phone
        // and pass this column to a flex expanded so that can scroll down
        SizedBox(
          height: myPostsHeight,
          width: MediaQuery.of(context).size.width,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: 30,
            itemBuilder: (BuildContext context, int index) {
              return Container(
                alignment: Alignment.center,
                width: 100,
                height: 30,
                child: Text("Post Entry $index"),
              );
            },
          ),
        ),
      ],
    );
  }
}
