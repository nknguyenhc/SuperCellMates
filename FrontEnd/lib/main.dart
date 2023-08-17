import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:requests/requests.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supercellmates/config/config.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/features/auth/logout.dart';

import 'package:supercellmates/locator.dart';
import 'package:supercellmates/router/router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SharedPreferences prefs = await SharedPreferences.getInstance();
  dynamic username = prefs.getString("username");
  dynamic sessionExpiryTimestamp = prefs.getInt("sessionExpiryTimestamp");
  bool isLoggedIn = username != null;
  bool isSessionExpired = sessionExpiryTimestamp != null &&
      sessionExpiryTimestamp < DateTime.now().millisecondsSinceEpoch;
  setupLocator(isLoggedIn && !isSessionExpired);
  runApp(MyApp(isLoggedIn: isLoggedIn, isSessionExpired: isSessionExpired));
}

class MyApp extends StatelessWidget {
  const MyApp(
      {super.key, required this.isLoggedIn, required this.isSessionExpired});

  final bool isLoggedIn;
  final bool isSessionExpired;

  @override
  Widget build(BuildContext context) {
    String host = Uri.parse(GetIt.I<Config>().restBaseURL).host;

    if (isLoggedIn) {
      if (!isSessionExpired) {
        SharedPreferences.getInstance().then(
          (prefs) {
            Requests.addCookie(
                host, "sessionid", prefs.getString("sessionid")!);
          },
        );
      } else {
        removeCookies();
        tickPrivacyAgreement();
        showCustomDialog(context, "Your session has expired",
            "Please log in again to continue!");
      }
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
