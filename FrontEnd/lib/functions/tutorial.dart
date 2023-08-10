import 'package:flutter/material.dart';
import 'package:tutorial_coach_mark/tutorial_coach_mark.dart';

TargetContent buildTutorialContent(String title, String content) {
  return TargetContent(
    align: ContentAlign.bottom,
    child: Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          title,
          style: const TextStyle(
              fontWeight: FontWeight.bold, color: Colors.white, fontSize: 24.0),
        ),
        Padding(
          padding: const EdgeInsets.only(top: 10.0),
          child: Text(
            content,
            style: const TextStyle(color: Colors.white, fontSize: 16.0),
          ),
        )
      ],
    ),
  );
}
