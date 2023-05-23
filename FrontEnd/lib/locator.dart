import 'package:get_it/get_it.dart';
import 'package:supercellmates/config/config.dart';
import 'package:supercellmates/config/dev_config.dart';
import 'package:supercellmates/router/router.dart';

GetIt locator = GetIt.I;

void setupLocator() {
  locator.registerLazySingleton<Config>(() => DevConfig());
  locator.registerSingleton<AppRouter>(AppRouter());
}
