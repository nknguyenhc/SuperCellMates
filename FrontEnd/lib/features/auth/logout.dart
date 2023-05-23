import 'package:flutter/material.dart';
import 'package:requests/requests.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'dart:convert';

import 'package:supercellmates/router/router.gr.dart';

class LogOutButton extends StatelessWidget {
  LogOutButton({Key? key}) : super(key: key);

  final String logoutURI = EndPoints.logout.endpoint;

  @override
  Widget build(BuildContext context) {
    return IconButton(
        onPressed: () {
          Requests.get(logoutURI).then((r) {
            r.raiseForStatus();
            if (jsonDecode(r.content())["message"] == "logged out") {
              //TODO: Requests.clearStoredCookies(hostname)
              AutoRouter.of(context)
                  .pushAndPopUntil(const LoginRoute(), predicate: (_) => false);
            }
          });
        },
        icon: const Icon(Icons.logout));
  }
}
