import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:photo_view/photo_view_gallery.dart';

@RoutePage()
class MultiplePhotosViewer extends StatefulWidget {
  const MultiplePhotosViewer(
      {Key? key,
      required this.listOfPhotoBytes,
      required this.initialIndex,
      required this.actionFunction})
      : super(key: key);

  final List<Uint8List> listOfPhotoBytes;
  final int initialIndex;
  final dynamic actionFunction;

  @override
  State<MultiplePhotosViewer> createState() => MultiplePhotosViewerState();
}

class MultiplePhotosViewerState extends State<MultiplePhotosViewer> {
  int currentIndex = -1;

  @override
  void initState() {
    super.initState();
    currentIndex = widget.initialIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Container(),
          actions: widget.actionFunction != null
              ? widget.actionFunction(currentIndex)
              : [],
        ),
        body: Stack(alignment: Alignment.bottomCenter, children: [
          PhotoViewGallery.builder(
              scrollPhysics: const BouncingScrollPhysics(),
              builder: (BuildContext context, int index) {
                return PhotoViewGalleryPageOptions(
                  imageProvider: MemoryImage(widget.listOfPhotoBytes[index]),
                );
              },
              itemCount: widget.listOfPhotoBytes.length,
              loadingBuilder: (context, event) => const Center(
                    child: SizedBox(
                      width: 20.0,
                      height: 20.0,
                      child: CircularProgressIndicator(),
                    ),
                  ),
              pageController: PageController(initialPage: widget.initialIndex),
              onPageChanged: (index) {
                setState(() {
                  currentIndex = index;
                });
              }),
          Container(
            padding: const EdgeInsets.all(30),
            child: Text(
              "${currentIndex + 1}/${widget.listOfPhotoBytes.length}",
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ]));
  }
}
