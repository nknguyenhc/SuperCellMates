import 'package:requests/requests.dart';

/// For sending GET request, returns the JSON response from backend
Future<dynamic> getRequest(String getURI) async {
  // TODO: ADD ERROR HANDLING
  var r1 = await Requests.get(getURI);
  r1.raiseForStatus();

  return r1.content();
}
