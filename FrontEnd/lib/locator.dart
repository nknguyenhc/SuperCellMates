import 'package:get_it/get_it.dart';
import 'package:supercellmates/config/config.dart';
import 'package:supercellmates/config/dev_config.dart';
import 'package:supercellmates/functions/notifications.dart';
//import 'package:supercellmates/config/prod_config.dart';
import 'package:supercellmates/router/router.dart';

GetIt locator = GetIt.I;

void setupLocator(bool isLoggedIn) {
  // locator.registerLazySingleton<Config>(() => DevConfig());
  locator.registerLazySingleton<Config>(() => ProdConfig());
  locator.registerSingleton<AppRouter>(AppRouter(isLoggedIn: isLoggedIn));
  locator.registerSingleton<Notifications>(Notifications());
}
