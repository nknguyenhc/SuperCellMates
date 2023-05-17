import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import '../router/router.gr.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key, required this.data}) : super(key: key);

  final dynamic data;

  @override
  State<ProfilePage> createState() => ProfilePageState();
}

class ProfilePageState extends State<ProfilePage> {
  @override
  Widget build(BuildContext context) {
    var tagList = widget.data["tagListString"].split(";");

    return Column(
      children: [
        Container(
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
                        onPressed: () =>
                            AutoRouter.of(context).push(const AddTagRoute()),
                        icon: const Icon(Icons.add_circle_outline_rounded),
                        iconSize: 50,);
              }),
        )
      ],
    );
  }
}
