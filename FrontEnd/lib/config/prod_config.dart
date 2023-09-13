import 'config.dart';

class ProdConfig extends Config {
  @override
  bool get production => true;

  /// deploy server
  @override
  String get restBaseURL => "https://matchminer.fly.dev";

  @override
  String get wsBaseURL => "wss://matchminer.fly.dev/ws";

  @override
  int get totalUploadLimit => 3000000; // 3MB

  // int get connectTimeout => 10000; // 10s
  // int get receiveTimeout => 6000; // 6s
}
