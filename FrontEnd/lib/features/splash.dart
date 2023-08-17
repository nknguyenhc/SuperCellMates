import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:requests/requests.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:supercellmates/config/config.dart';
import 'package:supercellmates/features/auth/logout.dart';
import 'package:supercellmates/global.dart';
import 'package:supercellmates/router/router.gr.dart';

@RoutePage()
class SplashPage extends StatelessWidget {
  const SplashPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    SharedPreferences.getInstance().then((prefs) {
      dynamic username = prefs.getString("username");
      dynamic sessionExpiryTimestamp = prefs.getInt("sessionExpiryTimestamp");
      bool isLoggedIn = username != null;
      bool isSessionExpired = sessionExpiryTimestamp != null &&
          sessionExpiryTimestamp < DateTime.now().millisecondsSinceEpoch;

      if (isLoggedIn) {
        if (!isSessionExpired) {
          String host = Uri.parse(GetIt.I<Config>().restBaseURL).host;
          Requests.addCookie(host, "sessionid", prefs.getString("sessionid")!);
          context.router.pushAndPopUntil(
            const MainScaffold(),
            predicate: (_) => false,
          );
        } else {
          toPromptSessionExpiry = true;
          removeCookies();
          tickPrivacyAgreement();
          context.router.pushAndPopUntil(
            const LoginRoute(),
            predicate: (_) => false,
          );
        }
      } else {
        context.router.pushAndPopUntil(
          const LoginRoute(),
          predicate: (_) => false,
        );
      }
    });

    return Container();
  }
}
