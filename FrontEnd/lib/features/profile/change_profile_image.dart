import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supercellmates/http_requests/endpoints.dart';

import 'package:supercellmates/http_requests/make_requests.dart';

class ChangeProfileImageButton extends StatelessWidget {
  ChangeProfileImageButton({Key? key, required this.callBack})
      : super(key: key);
  final imagePicker = ImagePicker();
  final dynamic callBack;

  // TODO: Abstract this
  void _showSuccessDialog(BuildContext context) {
    showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            content: const SingleChildScrollView(
              child: ListBody(
                children: <Widget>[
                  Text("Successfully updated profile image."),
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

  void _showCustomDialog(BuildContext context, String message) {
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

  @override
  Widget build(BuildContext context) {
    return TextButton(
        onPressed: () async {
          final XFile? image =
              await imagePicker.pickImage(source: ImageSource.gallery);
          if (image != null) {
            var body = {"img": await image.readAsBytes()};
            final response =
                await postWithCSRF(EndPoints.setProfileImage.endpoint, body);
            if (response == "success") {
              callBack();
              _showSuccessDialog(context);
            } else {
              _showCustomDialog(context, response);
            }
          }
        },
        child: const Text("Change Profile Image"));
  }
}
