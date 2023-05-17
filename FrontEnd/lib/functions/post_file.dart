import 'package:image_picker/image_picker.dart';
import 'package:requests/requests.dart';
import 'package:http/http.dart' as http;

import 'dart:io';

/// For sending POST request, returns the JSON response from backend
Future<dynamic> postFile(String getURI, String postURI, XFile file) async {
  // TODO: ADD ERROR HANDLING
  var r1 = await Requests.get(getURI);
  r1.raiseForStatus();

  if (!r1.headers.containsKey('set-cookie')) return "";

  // retrieve the CSRF token from the response of the GET request
  String cookies = r1.headers['set-cookie']!;

  int csrfIndex = cookies.indexOf('csrftoken=');
  if (csrfIndex == -1) return "";

  int semicolonIndex = cookies.substring(csrfIndex).indexOf(";");

  if (semicolonIndex != -1) {
    // Upload file with CSRF token
    var r2 = http.MultipartRequest("POST", Uri.parse(postURI));
    r2.headers.addAll(
        {"X-CSRFToken": cookies.substring(csrfIndex + 10, semicolonIndex),
        "cookie": "csrftoken="+cookies.substring(csrfIndex + 10, semicolonIndex)});

    r2.files.add(http.MultipartFile.fromBytes(
        'file', await File(file.path).readAsBytes()));

    r2.send().then((response) {
      return response;
    });
  }

  return "";
}
