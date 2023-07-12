import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/features/dialogs.dart';
import 'package:supercellmates/http_requests/endpoints.dart';
import 'package:supercellmates/http_requests/make_requests.dart';

@RoutePage()
class ChangeNamePage extends StatefulWidget {
  const ChangeNamePage({Key? key, required this.updateProfileMapCallBack})
      : super(key: key);

  final dynamic updateProfileMapCallBack;

  @override
  State<ChangeNamePage> createState() => ChangeNamePageState();
}

class ChangeNamePageState extends State<ChangeNamePage> {
  String newName = "";
  String password = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: AppBar(title: const Text("Change Name")),
        body: Row(
          children: [
            const Padding(padding: EdgeInsets.only(left: 20)),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(padding: EdgeInsets.only(top: 10)),

                // New name
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text("New name:"),
                    const Padding(padding: EdgeInsets.only(left: 10)),
                    SizedBox(
                        width: MediaQuery.of(context).size.width - 200,
                        child: TextField(
                          decoration: const InputDecoration(
                              isDense: true,
                              contentPadding:
                                  EdgeInsets.only(bottom: 5, top: 25)),
                          maxLength: 15,
                          onChanged: (value) => newName = value,
                        ))
                  ],
                ),
                const Padding(padding: EdgeInsets.only(top: 20)),

                // Password
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text("Your password:"),
                    const Padding(padding: EdgeInsets.only(left: 10)),
                    SizedBox(
                        width: MediaQuery.of(context).size.width - 200,
                        child: TextField(
                          obscureText: true,
                          decoration: const InputDecoration(
                              isDense: true,
                              contentPadding: EdgeInsets.only(
                                bottom: 5,
                              )),
                          onChanged: (value) => password = value,
                        ))
                  ],
                ),
                const Padding(padding: EdgeInsets.only(top: 30)),

                // Submit button
                TextButton(
                    onPressed: () {
                      if (newName == "") {
                        showErrorDialog(
                            context, "New name cannot be empty!");
                      } else if (password.length < 6) {
                        showErrorDialog(context, "Password is too short!");
                      } else {
                        showConfirmationDialog(
                            context, "Are you sure to change your name?",
                            () async {
                          startUploadingDialog(context, "data");
                          dynamic body = {
                            "name": newName,
                            "password": password,
                          };
                          dynamic response = await postWithCSRF(
                              EndPoints.changeName.endpoint, body);
                          stopLoadingDialog(context);
                          Future.delayed(Duration(milliseconds: 100))
                              .then((value) {
                            if (response == "Name changed") {
                              context.router.pop().then((value) {
                                widget.updateProfileMapCallBack();
                                showSuccessDialog(
                                    context, "Successfully updated username!");
                              });
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
