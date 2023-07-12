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
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        SizedBox(
          height: 25,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CustomCheckbox(togglePACheckedFunction: widget.togglePACheckedFunction, tickColor: Colors.blue, boxColor: Colors.white,),
              const Text(
                "I have read and agree to the ",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                ),
                softWrap: true,
              ),
              const Padding(padding: EdgeInsets.only(right: 7))
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
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    decoration: TextDecoration.underline,
                    decorationColor: Color.fromARGB(255, 255, 147, 147),
                    color: Color.fromARGB(255, 255, 147, 147)),
              ),
            ),
          ]),
        ),
      ],
    );
  }
}
