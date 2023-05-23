import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supercellmates/http_requests/endpoints.dart';

import 'package:supercellmates/http_requests/make_requests.dart';

class ChangeProfileImageButton extends StatelessWidget {
  ChangeProfileImageButton({Key? key}) : super(key: key);
  final imagePicker = ImagePicker();

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
            // TODO: success/error handling
          }
        },
        child: const Text("Change Profile Image"));
  }
}
