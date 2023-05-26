import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:requests/requests.dart';
import 'package:get_it/get_it.dart';

import 'package:supercellmates/config/config.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';
import 'package:supercellmates/router/router.gr.dart';

class LogOutButton extends StatelessWidget {
  const LogOutButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconButton(
        onPressed: () {
          getRequest(EndPoints.logout.endpoint, null).then((message) {
            if (message == "logged out") {
              Requests.clearStoredCookies(GetIt.I<Config>().restBaseURL);
              AutoRouter.of(context)
                  .pushAndPopUntil(const LoginRoute(), predicate: (_) => false);
            }
          });
        },
        icon: const Icon(Icons.logout));
  }
}
