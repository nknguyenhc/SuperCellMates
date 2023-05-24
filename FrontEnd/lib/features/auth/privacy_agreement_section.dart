import 'package:flutter/material.dart';
import 'package:auto_route/auto_route.dart';

import 'package:supercellmates/router/router.gr.dart';
import '../custom_checkbox.dart';

class PrivacyAgreementSection extends StatefulWidget {
  const PrivacyAgreementSection(
      {required this.togglePACheckedFunction, Key? key})
      : super(key: key);

  final Function() togglePACheckedFunction;

  @override
  State<PrivacyAgreementSection> createState() =>
      PrivacyAgreementSectionState();
}

class PrivacyAgreementSectionState extends State<PrivacyAgreementSection> {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 25,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CustomCheckbox(togglePACheckedFunction: widget.togglePACheckedFunction),
              const Text(
                "I have read and agree to the ",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                ),
                softWrap: true,
              ),
            ],
          ),
        ),
        SizedBox(
          height: 25,
          child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Padding(padding: EdgeInsets.only(left: 6)),
            InkWell(
              onTap: () =>
                  AutoRouter.of(context).push(const PrivacyAgreementRoute()),
              child: const Text(
                "data privacy agreement",
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    decoration: TextDecoration.underline,
                    decorationColor: Color.fromARGB(255, 239, 161, 161),
                    color: Color.fromARGB(255, 239, 161, 161)),
              ),
            ),
          ]),
        ),
      ],
    );
  }
}
