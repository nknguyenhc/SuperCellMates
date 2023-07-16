import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';
import 'package:supercellmates/config/config.dart';

/// For sending POST request, returns the JSON response from backend
Future<dynamic> postWithCSRF(String postEndPoint, dynamic postBody) async {
  String getURL = _composeURL("/async");
  String postURL = _composeURL(postEndPoint);

  String csrfToken = "";

  await Requests.getStoredCookies(GetIt.I<Config>().restBaseURL)
      .then((cookieJar) => cookieJar.delegate)
      .then((cookieMap) async {
    if (cookieMap["csrftoken"] == null) {
      // get CSRF token from /async, if not yet obtained
      try {
        dynamic r1 = await Requests.get(getURL);
        csrfToken =
            getCookieFromString(r1.headers['set-cookie'], "csrftoken", 10);
      } catch (e) {
        return "Connection error";
      }
    } else {
      // load the stored CSRF token
      csrfToken = cookieMap["csrftoken"]!.value;
    }
  });

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
      if (r2.headers['set-cookie'] != null) {
        getCookieFromString(r2.headers['set-cookie'], "sessionid", 10);
      }
      return r2.body;
    } catch (e) {
      return "Connection error";
    }
  }

  return "Connection error";
}

String getCookieFromString(String s, String name, int prefixLength) {
  if (s.isEmpty) return "";
  int index = s.indexOf(name);
  if (index == -1) return "";
  int semicolonIndex = s.indexOf(";", index);
  String cookie = s.substring(index + prefixLength, semicolonIndex);
  Requests.addCookie(GetIt.I<Config>().restBaseURL, name, cookie);
  return cookie;
}

/// For sending GET request, returns the JSON response from backend
Future<dynamic> getRequest(String getEndPoint, dynamic query) async {
  dynamic r1;

  try {
    r1 = await Requests.get(_composeURL(getEndPoint),
        queryParameters: query, persistCookies: true);
    if (r1.headers['set-cookie'] != null) {
      getCookieFromString(r1.headers['set-cookie'], "csrftoken", 10);
    }
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

String _composeURL(String endPoint) {
  return GetIt.I<Config>().restBaseURL + endPoint;
}
