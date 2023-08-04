import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_login/flutter_login.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supercellmates/features/custom_checkbox.dart';
import 'package:supercellmates/http_requests/endpoints.dart';

import '../../http_requests/make_requests.dart';
import '../../router/router.gr.dart';
import 'privacy_agreement_section.dart';

@RoutePage()
class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage> {
  bool privacyAgreementChecked = CustomCheckbox.ischecked;

  // TODO: lock PA action when logging in

  // set state function passed to descendants in the widget tree
  // called in check box widget
  void togglePAChecked() {
    setState(() {
      privacyAgreementChecked = !privacyAgreementChecked;
    });
  }

  // called when login button is pressed
  Future<String?> _authUser(LoginData data) {
    if (!privacyAgreementChecked) {
      return Future.value(
          "Please read and agree to our data privacy agreement");
    }

    Map<String, String> body = {
      "username": data.name, // unique immutable username
      "password": data.password,
    };

    var response = postWithCSRF(EndPoints.login.endpoint, body);
    return response.then((message) async {
      if (message == "logged in") {
        SharedPreferences prefs = await SharedPreferences.getInstance();
        prefs.setString("username", body["username"]!);
        prefs.setString("sessionid", await retrieveCookie("sessionid"));
        prefs.setString("csrftoken", await retrieveCookie("csrftoken"));
        return null;
      }
      return message;
    });
  }

  // called when signup botton is pressed
  // prevents switching to additional page if UID is taken
  Future<String?> _checkUniqueUsername(SignupData data) {
    if (!privacyAgreementChecked) {
      return Future.value(
          "Please read and agree to our data privacy agreement");
    }

    Map<String, String?> body = {
      "username": data.name, // unique immutable username
    };

    var response = getRequest(EndPoints.checkUniqueUsername.endpoint, body);

    return response.then((message) {
      if (message == "username is unique") {
        return null;
      }
      return message;
    });
  }

  // called when additional fields' submit button is pressed
  Future<String?> _registerUser(SignupData data) {
    if (!privacyAgreementChecked) {
      return Future.value(
          "Please read and agree to our data privacy agreement");
    }

    Map<String?, String?> body = {
      "name": data.additionalSignupData!["displayName"],
      "username": data.name,
      "password": data.password,
    };

    var response = postWithCSRF(EndPoints.register.endpoint, body);

    return response.then((message) async {
      if (message == "account created") {
        SharedPreferences prefs = await SharedPreferences.getInstance();
        prefs.setString("username", body["username"]!);
        prefs.setString("sessionid", await retrieveCookie("sessionid"));
        prefs.setString("csrftoken", await retrieveCookie("csrftoken"));
        return null;
      }
      return message;
    });
  }

  Future<String?> _recoverPassword(String name) {
    // should never reach here
    return Future.value("Recover password function not supported");
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false,
      child: FlutterLogin(
        logo: "assets/images/MatchMiner_logo.png",
        onLogin: _authUser,
        onSignup: _registerUser,
        onRecoverPassword: _recoverPassword,
        onSwitchToAdditionalFields: _checkUniqueUsername,
        onSubmitAnimationCompleted: () {
          AutoRouter.of(context)
              .pushAndPopUntil(const MainScaffold(), predicate: (_) => false);
        },
        userType: LoginUserType.name,
        userValidator: (username) {
          final validCharacters = RegExp(r'^[a-zA-Z0-9]+$');
          if (username == "" || username == null) {
            return "Username cannot be empty!";
          } else if (username.length > 15) {
            return "Username is too long!";
          } else if (!validCharacters.hasMatch(username)) {
            return "Username must be alphanumeric!";
          }
          // TODO: ADD MORE VALIDATIONS
          return null;
        },
        passwordValidator: (password) {
          if (password == "" || password == null) {
            return "Password cannot be empty!";
          } else if (password.length < 6) {
            return "Password is too short!";
          }
          return null;
        },
        theme: LoginTheme(primaryColor: Colors.lightBlue, logoWidth: 1),
        messages: LoginMessages(
            userHint: "Username",
            additionalSignUpFormDescription:
                "Create a name to be displayed\n(this can be changed later)",
            signUpSuccess: "Successfully signed up!"),
        additionalSignupFields: [
          UserFormField(
              icon: const Icon(Icons.person_rounded),
              keyName:
                  "displayName", // the non-unique, changeable, displayed username
              displayName: "Display Name",
              fieldValidator: (name) {
                if (name == "" || name == null) {
                  return "Name cannot be empty!";
                } else if (name.length > 15) {
                  return "Name is too long!";
                }
                // TODO: ADD MORE VALIDATIONS
                return null;
              })
        ],
        hideForgotPasswordButton: true,
        children: [
          Positioned(
            bottom: 40,
            height: 100,
            left: 0,
            width: MediaQuery.of(context).size.width,
            child: PrivacyAgreementSection(
                togglePACheckedFunction: togglePAChecked),
          )
        ],
      ),
    );
  }
}
