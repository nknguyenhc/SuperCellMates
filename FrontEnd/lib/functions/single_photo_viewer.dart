import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:photo_view/photo_view.dart';

@RoutePage()
class SinglePhotoViewer extends StatefulWidget {
  const SinglePhotoViewer(
      {Key? key, required this.photoBytes, required this.actions})
      : super(key: key);

  final Uint8List photoBytes;
  final List<Widget> actions;

  @override
  State<SinglePhotoViewer> createState() => SinglePhotoViewerState();
}

class SinglePhotoViewerState extends State<SinglePhotoViewer> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Container(),
          actions: widget.actions,
        ),
        body: SizedBox(
            child: PhotoView(imageProvider: MemoryImage(widget.photoBytes))));
  }
}
