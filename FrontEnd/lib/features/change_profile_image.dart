import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../functions/post_with_csrf.dart';

class ChangeProfileImageButton extends StatelessWidget {
  ChangeProfileImageButton({Key? key}) : super(key: key);
  final imagePicker = ImagePicker();

  final String getURI = "http://10.0.2.2:8000/async";
  final String changeProfileImageURI =
      "http://10.0.2.2:8000/profile/set_profile_image";

  @override
  Widget build(BuildContext context) {
    return TextButton(
        onPressed: () async {
          final XFile? image =
              await imagePicker.pickImage(source: ImageSource.gallery);
          if (image != null) {
            var body = {"img": await image.readAsBytes()};
            final response =
                await postWithCSRF(getURI, changeProfileImageURI, body);
            print("attempted to send image");
            // TODO: success/error handling
          }
        },
        child: const Text("Change Profile Image"));
  }
}
