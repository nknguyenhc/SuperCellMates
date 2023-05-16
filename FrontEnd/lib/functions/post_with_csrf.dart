import 'package:requests/requests.dart';

/// For sending POST request, returns the JSON response from backend
Future<dynamic> postWithCSRF(
  String getURI, String postURI, Map postBody) async {
  var r1 = await Requests.get(getURI);
  r1.raiseForStatus();

  if (!r1.headers.containsKey('set-cookie')) return "";

  // retrieve the CSRF token from the response of the GET request
  String cookies = r1.headers['set-cookie']!;

  int csrfIndex = cookies.indexOf('csrftoken=');
  if (csrfIndex == -1) return "";

  int semicolonIndex = cookies.substring(csrfIndex).indexOf(";");

  if (semicolonIndex != -1) {
    // Do the POST request with the CSRF token
    var r2 = await Requests.post(postURI, body: postBody, headers: {
      "X-CSRFToken": cookies.substring(csrfIndex + 10, semicolonIndex)
    });
    r2.raiseForStatus();

    return r2.content();
  }

  return "";
}
