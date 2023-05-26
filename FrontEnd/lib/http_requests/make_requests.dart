import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';
import 'package:supercellmates/config/config.dart';

/// For sending POST request, returns the JSON response from backend
Future<dynamic> postWithCSRF(String postEndPoint, Map postBody) async {
  String getURL = _composeURL("/async");
  String postURL = _composeURL(postEndPoint);

  // TODO: ADD ERROR HANDLING
  var r1 = await Requests.get(getURL);
  r1.raiseForStatus();

  if (!r1.headers.containsKey('set-cookie')) return "";

  // retrieve the CSRF token from the response of the GET request
  String cookies = r1.headers['set-cookie']!;

  int csrfIndex = cookies.indexOf('csrftoken=');
  if (csrfIndex == -1) return "";

  int semicolonIndex = cookies.substring(csrfIndex).indexOf(";");

  if (semicolonIndex != -1) {
    // Do the POST request with the CSRF token
    var r2 = await Requests.post(postURL, body: postBody, headers: {
      "X-CSRFToken": cookies.substring(csrfIndex + 10, semicolonIndex)
    });
    r2.raiseForStatus();

    return r2.content();
  }

  return "";
}

/// For sending GET request, returns the JSON response from backend
Future<dynamic> getRequest(String getEndPoint, dynamic query) async {
  // TODO: ADD ERROR HANDLING
  var r1 = await Requests.get(_composeURL(getEndPoint), queryParameters: query);
  r1.raiseForStatus();

  return r1.content();
}

String _composeURL(String endPoint) {
  return GetIt.I<Config>().restBaseURL + endPoint;
}
