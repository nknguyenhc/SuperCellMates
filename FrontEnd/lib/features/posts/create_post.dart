import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

@RoutePage()
class CreatePostPage extends StatefulWidget {
  const CreatePostPage({Key? key}) : super(key: key);

  @override
  State<CreatePostPage> createState() => CreatePostPageState();
}

class CreatePostPageState extends State<CreatePostPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("CreatePost page header")),
      body: 
        Container(
          alignment: Alignment.center,
          child: const Text("CreatePost page body"),
        )
    );
  }
}
