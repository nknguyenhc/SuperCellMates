import 'package:flutter/material.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:image_picker/image_picker.dart';

Future<CroppedFile?> cropSquaredImage(XFile imageFile) async {
  return ImageCropper().cropImage(
    sourcePath: imageFile.path,
    aspectRatio: const CropAspectRatio(ratioX: 1.0, ratioY: 1.0),
    uiSettings: [
      AndroidUiSettings(
          toolbarTitle: 'Crop a squared image',
          toolbarColor: Colors.blue,
          toolbarWidgetColor: Colors.white,
          activeControlsWidgetColor: Colors.blue,
          ),
      IOSUiSettings(
        title: 'Crop a squared image',
      ),
    ],
  );
}

Future<CroppedFile?> cropImage(XFile imageFile) async {
  return ImageCropper().cropImage(
    sourcePath: imageFile.path,
    aspectRatioPresets: [CropAspectRatioPreset.original, CropAspectRatioPreset.square,],
    uiSettings: [
      AndroidUiSettings(
          toolbarTitle: 'Crop your image',
          toolbarColor: Colors.blue,
          toolbarWidgetColor: Colors.white,
          activeControlsWidgetColor: Colors.blue,
          lockAspectRatio: false,
          ),
      IOSUiSettings(
        title: 'Crop your image',
      ),
    ],
  );
}
