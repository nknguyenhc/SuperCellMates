import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

void showConfirmationDialog(
    BuildContext context, String message, dynamic confirmationCallback) {
  showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Confirmation"),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text(message),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('No'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: const Text('Yes'),
              onPressed: () {
                Navigator.of(context).pop();
                confirmationCallback();
              },
            ),
          ],
        );
      });
}

void showConfirmationDialogWithInput(BuildContext context, String message,
    String hint, dynamic confirmationCallback) {
  showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        String input = "";
        return AlertDialog(
          title: const Text("Confirmation"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SingleChildScrollView(
                child: ListBody(
                  children: <Widget>[
                    Text(message),
                  ],
                ),
              ),
              const Padding(padding: EdgeInsets.only(top: 20)),
              TextField(
                obscureText: true,
                decoration: InputDecoration(
                    hintText: hint,
                    isDense: true,
                    contentPadding: const EdgeInsets.only(
                      bottom: 5,
                    )),
                onChanged: (value) => input = value,
              )
            ],
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('No'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: const Text('Yes'),
              onPressed: () {
                confirmationCallback(input);
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      });
}

void showSuccessDialog(BuildContext context, String message) {
  showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text(message),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('OK'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      });
}

void showErrorDialog(BuildContext context, String message) {
  showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text("Error"),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text(message),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('OK'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      });
}

void showCustomDialog(BuildContext context, String title, String message) {
  showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(title),
          content: SingleChildScrollView(
            child: ListBody(
              children: <Widget>[
                Text(message),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('OK'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      });
}

void startLoadingDialog(BuildContext context, Widget loadingAnimation) {
  showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (BuildContext context) {
      return SimpleDialog(
        elevation: 0.0,
        backgroundColor:
            Colors.transparent, // can change this to your prefered color
        children: <Widget>[
          Center(
            child: loadingAnimation,
          )
        ],
      );
    },
  );
}

void startUploadingDialog(BuildContext context, String item) {
  startLoadingDialog(
      context,
      Column(
        children: [
          CircularProgressIndicator(),
          Padding(padding: EdgeInsets.only(top: 10)),
          Text(
            "Uploading $item...",
            style: TextStyle(color: Colors.white),
          )
        ],
      ));
}

void stopLoadingDialog(BuildContext context) {
  context.router.pop();
}
