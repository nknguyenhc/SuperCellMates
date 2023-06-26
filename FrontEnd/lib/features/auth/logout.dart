import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';

import 'package:supercellmates/config/config.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

class LogOutButton extends StatelessWidget {
  const LogOutButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextButton(
        onPressed: () {
          showConfirmationDialog(context, "Are you sure to log out?", () {
            getRequest(EndPoints.logout.endpoint, null).then((message) {
              if (message == "logged out") {
                Requests.clearStoredCookies(GetIt.I<Config>().restBaseURL);
                AutoRouter.of(context).pushAndPopUntil(const LoginRoute(),
                    predicate: (_) => false);
              } else {
                showErrorDialog(context, message);
              }
            });
          });
        },
        child: const Row(
          children: [
            Icon(
              Icons.logout,
              size: 35,
            ),
            Padding(padding: EdgeInsets.only(right: 5)),
            Text(
              "Log out",
              style: TextStyle(fontSize: 16),
            )
          ],
        ));
  }
}
