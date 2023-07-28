import 'package:flutter/material.dart';
import 'package:supercellmates/features/dialogs.dart';

Map matchingIndexColors = {
  0: Colors.white,
  1: Colors.white,
  2: Colors.yellow,
  3: Colors.yellow,
  4: Colors.yellowAccent,
  5: Colors.yellowAccent
};

Widget buildMatchingIndexButton(BuildContext context, int matchingIndex) {
  return TextButton(
      onPressed: () {
        showCustomDialog(
            context,
            "Matching index",
            "Your matching index with this user is $matchingIndex out of 5."
                "\n\nMatching index is calculated based on the similarity of your tags,"
                " as well as your recent activities in your common tags.");
      },
      style: const ButtonStyle(
          padding: MaterialStatePropertyAll(EdgeInsets.zero),
          backgroundColor: MaterialStatePropertyAll(Colors.lightBlue),
          shape: MaterialStatePropertyAll(CircleBorder())),
      child: Text(
        matchingIndex.toString(),
        style: TextStyle(
            color: matchingIndexColors[matchingIndex],
            fontWeight: FontWeight.bold),
      ));
}