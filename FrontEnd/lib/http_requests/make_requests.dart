import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';
import 'package:supercellmates/config/config.dart';

/// For sending POST request, returns the JSON response from backend
Future<dynamic> postWithCSRF(String postEndPoint, dynamic postBody) async {
  String getURL = _composeURL("/async");
  String postURL = _composeURL(postEndPoint);

  String csrfToken = await retrieveCookie("csrftoken");

  if (csrfToken == "") {
    // get CSRF token from /async, if not yet obtained
    try {
      await Requests.get(getURL);
      csrfToken = await retrieveCookie("csrftoken");
    } catch (e) {
      return "Connection error";
    }
  }

  if (csrfToken != "") {
    // Do the POST request with the CSRF token
    dynamic r2;
    try {
      r2 = await Requests.post(postURL,
          body: postBody,
          headers: {
            "X-CSRFToken": csrfToken,
          },
          timeoutSeconds: 30);
      return r2.body;
    } catch (e) {
      return "Connection error";
    }
  }

  return "Connection error";
}

/// For sending GET request, returns the JSON response from backend
Future<dynamic> getRequest(String getEndPoint, dynamic query) async {
  dynamic r1;

  try {
    r1 = await Requests.get(_composeURL(getEndPoint),
        queryParameters: query, persistCookies: true);
  } catch (e) {
    return "Connection error";
  }
  return r1.body;
}

Future<dynamic> getCookies(String getEndpoint, dynamic query) async {
  String getURL = _composeURL(getEndpoint);
  dynamic r1;

  try {
    r1 = await Requests.get(getURL);
  } catch (e) {
    return "Connection error";
  }

  if (!r1.headers.containsKey('set-cookie')) return "";

  // retrieve the String value of set-cookie in the response
  return r1.headers['set-cookie']!;
}

Future<String> retrieveCookie(String name) async {
  String host = Uri.parse(GetIt.I<Config>().restBaseURL).host;
  dynamic cookieJar = await Requests.getStoredCookies(host);
  return cookieJar.delegate[name] == null
      ? ""
      : cookieJar.delegate[name]!.value;
}

String _composeURL(String endPoint) {
  return GetIt.I<Config>().restBaseURL + endPoint;
}
