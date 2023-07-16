import 'config.dart';

class ProdConfig extends Config {
  @override
  bool get production => true;

  /// Your local server
  @override
  String get restBaseURL => "https://matchminer-d5ebcada4488.herokuapp.com";

  @override
  String get wsBaseURL => "wss://matchminer-d5ebcada4488.herokuapp.com/ws";

  @override
  int get totalUploadLimit => 3000000; // 3MB

  // int get connectTimeout => 10000; // 10s
  // int get receiveTimeout => 6000; // 6s
}


