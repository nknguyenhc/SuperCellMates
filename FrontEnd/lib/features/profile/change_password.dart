import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

@RoutePage()
class ChangePasswordPage extends StatefulWidget {
  const ChangePasswordPage({Key? key}) : super(key: key);

  @override
  State<ChangePasswordPage> createState() => ChangePasswordPageState();
}

class ChangePasswordPageState extends State<ChangePasswordPage> {
  String oldPassword = "";
  String newPassword = "";
  String confirmNewPassword = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: AppBar(title: const Text("Change password")),
        body: Row(
          children: [
            const Padding(padding: EdgeInsets.only(left: 30)),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(padding: EdgeInsets.only(top: 10)),

                // Old password
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Old password:"),
                    const Padding(padding: EdgeInsets.only(top: 10)),
                    SizedBox(
                        width: MediaQuery.of(context).size.width - 100,
                        child: TextField(
                          obscureText: true,
                          decoration: const InputDecoration(
                              isDense: true,
                              contentPadding: EdgeInsets.only(bottom: 5)),
                          onChanged: (value) => oldPassword = value,
                        ))
                  ],
                ),
                const Padding(padding: EdgeInsets.only(top: 40)),

                // New password
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("New password:"),
                    const Padding(padding: EdgeInsets.only(top: 10)),
                    SizedBox(
                        width: MediaQuery.of(context).size.width - 100,
                        child: TextField(
                          obscureText: true,
                          decoration: const InputDecoration(
                              isDense: true,
                              contentPadding: EdgeInsets.only(bottom: 5)),
                          onChanged: (value) => newPassword = value,
                        ))
                  ],
                ),
                const Padding(padding: EdgeInsets.only(top: 30)),

                // Password
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Confirm new password:"),
                    const Padding(padding: EdgeInsets.only(top: 10)),
                    SizedBox(
                        width: MediaQuery.of(context).size.width - 100,
                        child: TextField(
                          obscureText: true,
                          decoration: const InputDecoration(
                              isDense: true,
                              contentPadding: EdgeInsets.only(
                                bottom: 5,
                              )),
                          onChanged: (value) => confirmNewPassword = value,
                        ))
                  ],
                ),
                const Padding(padding: EdgeInsets.only(top: 30)),

                // Submit button
                TextButton(
                    onPressed: () {
                      if (oldPassword.length < 6) {
                        showErrorDialog(context, "Old password is too short!");
                      } else if (newPassword != confirmNewPassword) {
                        showErrorDialog(context, "New passwords do not match!");
                      } else if (newPassword.length < 6) {
                        showErrorDialog(context, "New password is too short!");
                      } else {
                        showConfirmationDialog(
                            context, "Are you sure to change your password?",
                            () async {
                          startUploadingDialog(context, "data");
                          dynamic body = {
                            "old_password": oldPassword,
                            "new_password": newPassword,
                          };
                          dynamic response = await postWithCSRF(
                              EndPoints.changePassword.endpoint, body);
                          stopLoadingDialog(context);
                          Future.delayed(Duration(milliseconds: 100))
                              .then((value) {
                            if (response == "Password changed") {
                              context.router.pop().then((value) =>
                                  showSuccessDialog(context,
                                      "Successfully updated password!"));
                            } else {
                              showErrorDialog(context, response);
                            }
                          });
                        });
                      }
                    },
                    style: const ButtonStyle(
                        backgroundColor: MaterialStatePropertyAll(Colors.blue)),
                    child: const Text(
                      "Submit",
                      style: TextStyle(color: Colors.white),
                    ))
              ],
            )
          ],
        ));
  }
}
