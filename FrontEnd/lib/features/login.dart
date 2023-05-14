import 'dart:convert';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_login/flutter_login.dart';
import 'package:supercellmates/router/router.dart';
//import 'package:requests/requests.dart';

import '../functions/post_with_csrf.dart';
import '../router/router.gr.dart';

@RoutePage()
class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  Duration get loginTime => const Duration(milliseconds: 1000);

  final String getURI = "http://10.0.2.2:8000/async";
  final String loginURI = "http://10.0.2.2:8000/login_async";
  final String registerURI = "http://10.0.2.2:8000/register_async";

  Future<String?> _authUser(LoginData data) {
    Map<String, String> body = {
      "username": data.name,
      "password": data.password,
    };

    var responseMap =
        post_with_csrf(getURI, loginURI, body).then((json) => jsonDecode(json));
    return responseMap.then((map) {
      if (map["message"] == "logged in") {
        return null;
      }
      return map["message"];
    });
  }

  Future<String?> _registerUser(SignupData data) {
    Map<String?, String?> body = {
      "username": data.name,
      "password": data.password,
    };

    var responseMap = post_with_csrf(getURI, registerURI, body)
        .then((json) => jsonDecode(json));
    return responseMap.then((map) {
      if (map["message"] == "account created") {
        return null;
      }
      return map["message"];
    });
  }

  Future<String?> _recoverPassword(String name) {
    return Future.value("1");
  }

  @override
  Widget build(BuildContext context) {
    return FlutterLogin(
        title: "MatchMiner",
        onLogin: _authUser,
        onSignup: _registerUser,
        onRecoverPassword: _recoverPassword,
        onSubmitAnimationCompleted: () {
          AutoRouter.of(context)
              .pushAndPopUntil(const MainScaffold(), predicate: (_) => false);
        },
        userType: LoginUserType.name,
        userValidator: (user) {
          if (user == "" || user == null) {
            return "Username cannot be empty!";
          } else if (user.length > 15) {
            return "Username is too long!";
          }
          // TODO: ADD MORE VALIDATIONS
          return null;
        },
        theme: LoginTheme(primaryColor: Colors.blue));
  }
}
