import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:supercellmates/features/dialogs.dart';

@RoutePage()
class CreatePostPage extends StatefulWidget {
  const CreatePostPage({Key? key, required this.tagName}) : super(key: key);

  final String tagName;

  @override
  State<CreatePostPage> createState() => CreatePostPageState();
}

class CreatePostPageState extends State<CreatePostPage> {
  String visibility = "Public";
  List<String> visibilityDescriptions = [
    "Visible to everyone",
    "Limit to my friends",
    "Limit to tag holders"
  ];
  bool showVisibilites = false;
  List<bool> isVisibilitiesChosen = [true, false, false];

  void collapseVisibilities() {
    setState(() {
      showVisibilites = false;
    });
  }

  void setVisibility(int index) {
    isVisibilitiesChosen[index] = !isVisibilitiesChosen[index];

    // resolve conflicts
    if (isVisibilitiesChosen[0] &&
        (isVisibilitiesChosen[1] || isVisibilitiesChosen[2])) {
      // keep the most recently updated one
      if (index == 0) {
        isVisibilitiesChosen[1] = false;
        isVisibilitiesChosen[2] = false;
      } else {
        isVisibilitiesChosen[0] = false;
      }
    }

    if (!(isVisibilitiesChosen[0] ||
        isVisibilitiesChosen[1] ||
        isVisibilitiesChosen[2])) {
      isVisibilitiesChosen[0] = true;
    }

    // set visibility text
    setState(() {
      visibility = isVisibilitiesChosen[0]
          ? "Public"
          : isVisibilitiesChosen[1] && isVisibilitiesChosen[2]
              ? "Friends with Tag"
              : isVisibilitiesChosen[1]
                  ? "Friends"
                  : "Tag";
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          titleSpacing: 0,
          title: const Text("Create a post"),
          actions: [
            IconButton(
                onPressed: () {
                  collapseVisibilities();
                  showConfirmationDialog(
                      context, "Are you sure to create this post?", () {});
                },
                icon: const Icon(Icons.add_task)),
            const Padding(padding: EdgeInsets.only(right: 20))
          ],
        ),
        body: Container(
            alignment: Alignment.center,
            child: Stack(children: [
              Column(crossAxisAlignment: CrossAxisAlignment.center, children: [
                // Bottom Bar
                SizedBox(
                  height: 40,
                  width: MediaQuery.of(context).size.width,
                  child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Tag name indicator
                        Text(
                          "Tag: \"${widget.tagName}\"",
                          style: const TextStyle(
                            fontSize: 16,
                          ),
                        ),
                        const Padding(padding: EdgeInsets.only(left: 10)),

                        // Visibility button
                        TextButton(
                            onPressed: () {
                              setState(() {
                                showVisibilites = !showVisibilites;
                              });
                            },
                            style: const ButtonStyle(
                                backgroundColor:
                                    MaterialStatePropertyAll(Colors.white),
                                iconColor:
                                    MaterialStatePropertyAll(Colors.indigo)),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  " $visibility",
                                ),
                                Transform.rotate(
                                  angle: 3.1415926 / 2 * 3,
                                  child: const Icon(
                                    Icons.arrow_right,
                                  ),
                                )
                              ],
                            ))
                      ]),
                )
              ]),

              // visibility settings drawer
              // as a child of the stack, overlays the content above
              showVisibilites
                  ? Container(
                      padding: EdgeInsets.fromLTRB(
                          MediaQuery.of(context).size.width - 190,
                          MediaQuery.of(context).size.height - 300,
                          30,
                          30),
                      height: MediaQuery.of(context).size.height - 120,
                      child: Container(
                          alignment: Alignment.bottomCenter,
                          width: 160,
                          height: 150,
                          color: const Color.fromARGB(255, 223, 234, 237),
                          child: ListView.builder(
                              scrollDirection: Axis.vertical,
                              itemCount: 3,
                              itemBuilder: (context, index) {
                                return Column(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    index == 0
                                        ? Container()
                                        : const Divider(
                                            height: 1,
                                            thickness: 1,
                                            indent: 12,
                                            endIndent: 25,
                                          ),
                                    Row(
                                      children: [
                                        TextButton(
                                            onPressed: () {
                                              setVisibility(index);
                                            },
                                            style: const ButtonStyle(
                                                padding:
                                                    MaterialStatePropertyAll(
                                                        EdgeInsets.only(
                                                            left: 13.5))),
                                            child: Text(
                                                visibilityDescriptions[index])),
                                        Padding(
                                            padding: EdgeInsets.only(
                                                left: index == 0
                                                    ? 6.5
                                                    : index == 1
                                                        ? 8
                                                        : 4)),
                                        isVisibilitiesChosen[index]
                                            ? const Icon(
                                                Icons.circle,
                                                size: 8,
                                              )
                                            : Container()
                                      ],
                                    )
                                  ],
                                );
                              })))
                  : Container(),
            ])));
  }
}
