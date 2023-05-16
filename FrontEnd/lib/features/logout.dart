import 'package:flutter/material.dart';
import 'package:requests/requests.dart';
import 'package:auto_route/auto_route.dart';
import 'dart:convert';

import '../router/router.gr.dart';

class LogOutButton extends StatelessWidget {
  const LogOutButton({Key? key}) : super(key: key);

  final String logoutURI = "http://10.0.2.2:8000/logout_async";

  @override
  Widget build(BuildContext context) {
    return IconButton(
        onPressed: () {
          Requests.get(logoutURI).then((r) {
            r.raiseForStatus();
            if (jsonDecode(r.content())["message"] == "logged out") {
              //TODO: Requests.clearStoredCookies(hostname)
              AutoRouter.of(context)
                  .pushAndPopUntil(LoginRoute(), predicate: (_) => false);
            }
          });
        },
        icon: const Icon(Icons.logout));
  }
}
