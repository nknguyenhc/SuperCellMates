import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supercellmates/http_requests/endpoints.dart';

import 'package:supercellmates/functions/crop_image.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

class ChangeProfileImageButton extends StatelessWidget {
  ChangeProfileImageButton({Key? key, required this.callBack})
      : super(key: key);
  final imagePicker = ImagePicker();
  final dynamic callBack;

  @override
  Widget build(BuildContext context) {
    return TextButton(
        style: const ButtonStyle(backgroundColor: MaterialStatePropertyAll(Colors.blue)),
        onPressed: () async {
          final XFile? image =
              await imagePicker.pickImage(source: ImageSource.gallery);
          if (image == null) return;
          final CroppedFile? croppedImage = await cropSquaredImage(image);
          if (croppedImage != null) {
            var body = {"img": await croppedImage.readAsBytes()};
            final response =
                await postWithCSRF(EndPoints.setProfileImage.endpoint, body);
            if (response == "success") {
              callBack();
              showSuccessDialog(context, "Successfully updated profile image.");
            } else {
              showErrorDialog(context, "Image is not in supported format.");
            }
          }
        },
        child: const Text("Change profile image",
        style: TextStyle(color: Colors.white)));
  }
}
