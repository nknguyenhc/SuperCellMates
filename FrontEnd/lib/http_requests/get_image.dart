import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';

import 'package:supercellmates/config/config.dart';

Future<Image> getImage(String endpoint) async {
  String profileImageURL = GetIt.I<Config>().restBaseURL + endpoint;
  var response = await Requests.get(profileImageURL);
  return Image.memory(response.bodyBytes);
}

Future<Uint8List> getRawImageData(String endpoint) async {
  String profileImageURL = GetIt.I<Config>().restBaseURL + endpoint;
  var response = await Requests.get(profileImageURL);
  return response.bodyBytes;
}

Future<Image> getSquaredImage(String endpoint, double width) async {
  String profileImageURL = GetIt.I<Config>().restBaseURL + endpoint;
  var response = await Requests.get(profileImageURL);
  return Image.memory(response.bodyBytes,
      width: width, height: width, fit: BoxFit.cover);
}
