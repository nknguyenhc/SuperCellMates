import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

@RoutePage()
class PrivacyAgreementPage extends StatelessWidget {
  const PrivacyAgreementPage({Key? key}) : super(key: key);

  final String logoutURI = "http://10.0.2.2:8000/logout_async";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(),
      body: Container(
          alignment: Alignment.center,
          child: const Text("Template Privacy Agreement")));
  }
}
