import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:requests/requests.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supercellmates/config/config.dart';

import 'package:supercellmates/locator.dart';
import 'package:supercellmates/router/router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SharedPreferences prefs = await SharedPreferences.getInstance();
  var username = prefs.getString("username");
  setupLocator(username != null);
  runApp(MyApp(isLoggedIn: username != null));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key, required this.isLoggedIn});

  final bool isLoggedIn;

  @override
  Widget build(BuildContext context) {
    String host = Uri.parse(GetIt.I<Config>().restBaseURL).host;

    if (isLoggedIn) {
      SharedPreferences.getInstance().then(
        (prefs) {
          Requests.addCookie(host, "sessionid", prefs.getString("sessionid")!);
        },
      );
    }

    return WillPopScope(
      child: MaterialApp.router(
        routerConfig: GetIt.I<AppRouter>().config(),
        title: 'SuperCellMates',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.lightBlue),
          useMaterial3: true,
        ),
      ),
      onWillPop: () async => false,
    );
  }
}
