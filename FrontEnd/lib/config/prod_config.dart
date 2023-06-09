import 'config.dart';

class ProdConfig extends Config {
  @override
  bool get production => true;

  /// Your local server
  @override
  String get restBaseURL => "http://matchminer.pythonanywhere.com";

  @override
  String get wsBaseURL => "ws://matchminer.pythonanywhere.com/ws";
  // int get connectTimeout => 10000; // 10s
  // int get receiveTimeout => 6000; // 6s
}


