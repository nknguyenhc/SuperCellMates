import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';
import 'package:supercellmates/router/router.gr.dart';

import 'change_profile_image.dart';

@RoutePage()
class EditProfilePage extends StatefulWidget {
  const EditProfilePage(
      {Key? key,
      required this.updateProfileImageCallBack,
      required this.updateProfileMapCallBack})
      : super(key: key);

  final dynamic updateProfileImageCallBack;
  final dynamic updateProfileMapCallBack;

  @override
  State<EditProfilePage> createState() => EditProfilePageState();
}

class EditProfilePageState extends State<EditProfilePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(titleSpacing: 0, title: const Text("Edit my profile")),
        body: Row(
          children: [
            const Padding(
              padding: EdgeInsets.only(left: 20),
            ),
            SizedBox(
                child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(padding: EdgeInsets.only(top: 10)),
                const Text(
                  "Profile",
                  style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 18),
                ),
                const Padding(padding: EdgeInsets.only(top: 10)),
                Row(
                  children: [
                    ChangeProfileImageButton(
                        callBack: widget.updateProfileImageCallBack),
                    const Padding(padding: EdgeInsets.only(right: 10)),
                    
                    // Change name button
                    TextButton(
                        style: const ButtonStyle(
                            backgroundColor:
                                MaterialStatePropertyAll(Colors.blue)),
                        onPressed: () async {
                          context.router.push(ChangeNameRoute(
                              updateProfileMapCallBack:
                                  widget.updateProfileMapCallBack));
                        },
                        child: const Text("Change name",
                            style: TextStyle(color: Colors.white))),
                    const Padding(padding: EdgeInsets.only(right: 10)),
                  ],
                ),
                const Padding(padding: EdgeInsets.only(top: 40)),
                const Text(
                  "Authentication",
                  style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 18),
                ),
                const Padding(padding: EdgeInsets.only(top: 10)),
                Row(
                  children: [
                    // Change username button
                    TextButton(
                        style: const ButtonStyle(
                            backgroundColor:
                                MaterialStatePropertyAll(Colors.blue)),
                        onPressed: () async {
                          context.router.push(ChangeUsernameRoute(
                              updateProfileMapCallBack:
                                  widget.updateProfileMapCallBack));
                        },
                        child: const Text("Change username",
                            style: TextStyle(color: Colors.white))),
                    const Padding(padding: EdgeInsets.only(right: 10)),

                    // Change password button
                    TextButton(
                        style: const ButtonStyle(
                            backgroundColor:
                                MaterialStatePropertyAll(Colors.blue)),
                        onPressed: () async {
                          context.router.push(const ChangePasswordRoute());
                        },
                        child: const Text("Change password",
                            style: TextStyle(color: Colors.white))),
                  ],
                ),
              ],
            ))
          ],
        ));
  }
}
