import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

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
  @override
  Widget build(BuildContext context) {
    var tagList = widget.data["tagListString"].split(";");

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        SizedBox(
          height: 70,
          child: ListView.builder(
              shrinkWrap: true,
              itemCount: tagList.length + 1,
              scrollDirection: Axis.horizontal,
              itemBuilder: (BuildContext context, int index) {
                return index < tagList.length
                    ? tagList[index] == ""
                        ? Container()
                        : TextButton(
                            onPressed: () => {}, child: Text(tagList[index]))
                    : IconButton(
                        onPressed: () => AutoRouter.of(context).push(
                            AddTagRoute(updateCallBack: widget.updateCallBack)),
                        icon: const Icon(Icons.add_circle_outline_rounded),
                        iconSize: 50,
                      );
              }),
        ),
        const Divider(
          color: Colors.grey,
          indent: 15,
          endIndent: 15,
        ),
        Row(
          children: [
            IconButton(
              icon: const Icon(Icons.note_add, size: 50),
              onPressed: () {},
            )
          ],
        ),
        Column(
          children: [
            // TODO: Change to Posts class
            SizedBox(
              height: 400,
              width: 100,
              child: ListView.builder(
                itemCount: 30,
                itemBuilder: (BuildContext context, int index) {
                  return SizedBox(
                    child: Text("Post Entry $index"),
                  );
                },
              ),
            )
          ],
        )
      ],
    );
  }
}
