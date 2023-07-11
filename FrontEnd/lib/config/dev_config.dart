import 'config.dart';

class DevConfig extends Config {
  @override
  bool get production => false; // when debugging with local server

  /// Your local server
  @override
  String get restBaseURL => "http://10.0.2.2:8000";

  @override
  String get wsBaseURL => "ws://10.0.2.2:8000/ws";

  // int get connectTimeout => 10000; // 10s
  // int get receiveTimeout => 6000; // 6s
}
