import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart' as cache;

import 'package:supercellmates/config/config.dart';

Future<Image> getImage(String endpoint, bool toUpdateCache) async {
  if (!toUpdateCache) {
    dynamic cachedImage =
        await cache.DefaultCacheManager().getFileFromCache(endpoint);
    if (cachedImage != null) {
      return Image.file(cachedImage.file);
    } else {
      return getImage(endpoint, true);
    }
  } else {
    String profileImageURL = GetIt.I<Config>().restBaseURL + endpoint;
    var response = await Requests.get(profileImageURL);
    cache.DefaultCacheManager()
        .putFile(endpoint, response.bodyBytes, maxAge: const Duration(days: 7));
    return Image.memory(response.bodyBytes);
  }
}

Future<Uint8List> getRawImageData(String endpoint, bool toUpdateCache) async {
  if (!toUpdateCache) {
    dynamic cachedImage =
        await cache.DefaultCacheManager().getFileFromCache(endpoint);
    if (cachedImage != null) {
      return cachedImage.file.readAsBytes();
    } else {
      return getRawImageData(endpoint, true);
    }
  } else {
    String profileImageURL = GetIt.I<Config>().restBaseURL + endpoint;
    var response = await Requests.get(profileImageURL);
    cache.DefaultCacheManager()
        .putFile(endpoint, response.bodyBytes, maxAge: const Duration(days: 7));
    return response.bodyBytes;
  }
}

// Future<Image> getSquaredImage(String endpoint, double width) async {
//   dynamic cachedImage =
//       await cache.DefaultCacheManager().getFileFromCache(endpoint);
//   if (cachedImage != null) {
//     return Image.file(cachedImage.file,
//         width: width, height: width, fit: BoxFit.cover);
//   } else {
//     String profileImageURL = GetIt.I<Config>().restBaseURL + endpoint;
//     var response = await Requests.get(profileImageURL);
//     cache.DefaultCacheManager().putFile(endpoint, response.bodyBytes);
//     return Image.memory(response.bodyBytes,
//         width: width, height: width, fit: BoxFit.cover);
//   }
// }
