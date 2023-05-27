import 'package:flutter/material.dart';
import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';

import 'package:supercellmates/config/config.dart';

Future<Image> getImage(String endpoint) async {
  String profileImageURL = GetIt.I<Config>().restBaseURL + endpoint;
  var response = await Requests.get(profileImageURL);
  return Image.memory(response.bodyBytes);
}

