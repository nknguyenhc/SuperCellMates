import 'dart:convert';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_login/flutter_login.dart';
//import 'package:requests/requests.dart';

import '../functions/post_with_csrf.dart';
import '../router/router.gr.dart';
import 'privacy_agreement_section.dart';

@RoutePage()
class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage> {
  Duration get loginTime => const Duration(milliseconds: 1000);

  final String getURI = "http://10.0.2.2:8000/async";
  final String loginURI = "http://10.0.2.2:8000/login_async";
  final String registerURI = "http://10.0.2.2:8000/register_async";
  final String privacyAgreementURI =
      'http://10.0.2.2:8000/privacy_agreement_async';

  bool privacyAgreementChecked = false;

  // TODO: lock PA action when logging in

  void togglePAChecked() {
    setState(() {
      privacyAgreementChecked = !privacyAgreementChecked;
    });
  }

  Future<String?> _authUser(LoginData data) {
    if (!privacyAgreementChecked) {
      return Future.value(
          "Please read and agree to our data privacy agreement");
    }

    Map<String, String> body = {
      "username": data.name,
      "password": data.password,
    };

    var responseMap =
        postWithCSRF(getURI, loginURI, body).then((json) => jsonDecode(json));
    return responseMap.then((map) {
      if (map["message"] == "logged in") {
        return null;
      }
      return map["message"];
    });
  }

  Future<String?> _registerUser(SignupData data) {
    if (!privacyAgreementChecked) {
      return Future.value(
          "Please read and agree to our data privacy agreement");
    }

    Map<String?, String?> body = {
      "username": data.name,
      "password": data.password,
    };

    var responseMap = postWithCSRF(getURI, registerURI, body)
        .then((json) => jsonDecode(json));
    return responseMap.then((map) {
      if (map["message"] == "account created") {
        return null;
      }
      return map["message"];
    });
  }

  Future<String?> _recoverPassword(String name) {
    return Future.value("Recover password function not supported");
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false,
      child: FlutterLogin(
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
        theme: LoginTheme(primaryColor: Colors.lightBlue),
        hideForgotPasswordButton: true,
        children: [
          Positioned(
            bottom: 60,
            height: 100,
            left: 0,
            width: 370,
            child: PrivacyAgreementSection(
                togglePACheckedFunction: togglePAChecked),
          )
        ],
      ),
    );
  }
}
