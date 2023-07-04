abstract class Config {
  /// if is in production environment
  bool get production;

  /// all RESTful API base URL, i.e., those via GET/POST/PUT/DELETE
  String get restBaseURL;

  String get wsBaseURL;

  // /// Time limit (ms) for making connections (uploading)
  // int get connectTimeout;

  // /// Time limit for making connections (uploading)
  // Duration get uploadTimeout => Duration(milliseconds: connectTimeout);

  // /// Time limit (ms) for connections (receiving from server)
  // int get receiveTimeout;

  // /// Time limit for connections (receiving from server)
  // Duration get downloadTimeout => Duration(milliseconds: receiveTimeout);

  // /// Time limit (ms) for connection (a round, uploading query + receiving data)
  // int get totalTimeout => connectTimeout + receiveTimeout;

  // /// Time limit for connection (a round, uploading query + receiving data)
  // Duration get roundTimeout => Duration(milliseconds: totalTimeout);
}

// abstract class DBConfig {
//   late String _dbName;
//   String get dbName => _dbName;
// }
