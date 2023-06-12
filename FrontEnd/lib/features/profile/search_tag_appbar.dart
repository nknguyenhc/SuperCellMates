import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/router/router.gr.dart';
import 'package:flutter/material.dart';
import 'package:easy_search_bar/easy_search_bar.dart';
import 'package:supercellmates/features/home/search.dart';

class SearchTagAppBar extends AppBar {
  SearchTagAppBar(
      {Key? key,
      required this.tagLimitReached,
      required this.updateCallBack,
      required this.onAddCallBack})
      : super(key: key);

  bool tagLimitReached;
  dynamic updateCallBack;
  dynamic onAddCallBack;

  @override
  State<SearchTagAppBar> createState() => SearchTagAppBarState();
}

class SearchTagAppBarState extends State<SearchTagAppBar> {
  @override
  void initState() {
    super.initState();
  }

  Timer? _searchTimer;

  @override
  Widget build(BuildContext context) {
    return EasySearchBar(
      onSearch: (input) {
        if (input == "") {
          setState(() {
            widget.updateCallBack(Container());
          });
          return;
        }
        if (_searchTimer == null || !_searchTimer!.isActive) {
          _searchTimer = Timer(const Duration(milliseconds: 1000), () async {
            widget.updateCallBack(
                await searchTag(context, widget.tagLimitReached, input, widget.onAddCallBack));
          });
        } else {
          _searchTimer!.cancel();
          _searchTimer = Timer(const Duration(milliseconds: 1000), () async {
            widget.updateCallBack(
                await searchTag(context, widget.tagLimitReached, input, widget.onAddCallBack));
          });
        }
      },
      searchHintText: "Search tag names...",
      actions: [
        IconButton(
          onPressed: () {
            AutoRouter.of(context).push(const RequestTagRoute());
          },
          icon: const Icon(Icons.add_circle),
          iconSize: 25,
        )
      ],
      title: const Text("Search for new tags"),
      backgroundColor: Colors.white,
      appBarHeight: 80,
      elevation: 0,
      titleTextStyle: Theme.of(context).appBarTheme.titleTextStyle,
    );
  }
}
