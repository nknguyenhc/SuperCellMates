import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supercellmates/config/config.dart';
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
        style: const ButtonStyle(
            backgroundColor: MaterialStatePropertyAll(Colors.blue)),
        onPressed: () async {
          final XFile? image = await imagePicker.pickImage(
              source: ImageSource.gallery, maxHeight: 600, maxWidth: 800);
          if (image == null) return;

          final CroppedFile? croppedImage = await cropSquaredImage(image);
          if (croppedImage != null) {
            Uint8List bytes = await croppedImage.readAsBytes();
            if (bytes.length > GetIt.I<Config>().totalUploadLimit) {
              showCustomDialog(
                  context,
                  "Image too large",
                  "Your image is larger than 3MB after compression.\n" +
                      "Please try again with smaller images.\n\n" +
                      "On behalf of our weak server, we apologise for your inconvenience -_-");
              return;
            }

            startUploadingDialog(context, "image");
            var body = {"img": jsonEncode(bytes)};
            final response =
                await postWithCSRF(EndPoints.setProfileImage.endpoint, body);
            stopLoadingDialog(context);
            Future.delayed(Duration(milliseconds: 100)).then((value) {
              if (response == "success") {
                callBack();
                showSuccessDialog(
                    context, "Successfully updated profile image.");
              } else {
                showErrorDialog(context, "Image is not in supported format.");
              }
            });
          }
        },
        child: const Text("Change profile image",
            style: TextStyle(color: Colors.white)));
  }
}
