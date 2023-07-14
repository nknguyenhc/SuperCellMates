import 'package:flutter/material.dart';

bool customCheckboxChecked = false;

class CustomCheckbox extends StatefulWidget {
  const CustomCheckbox(
      {required this.togglePACheckedFunction,
      required this.tickColor,
      required this.boxColor,
      super.key});

  final Function() togglePACheckedFunction;
  final Color tickColor;
  final Color boxColor;
  static bool ischecked = false;

  @override
  State<CustomCheckbox> createState() => _CustomCheckboxState();
}

class _CustomCheckboxState extends State<CustomCheckbox> {
  @override
  void initState() {
    super.initState();
  }

  void toggle() {
    widget.togglePACheckedFunction();
    setState(() {
      CustomCheckbox.ischecked = !CustomCheckbox.ischecked;
    });
  }

  @override
  Widget build(BuildContext context) {
    Color getColor(Set<MaterialState> states) {
      const Set<MaterialState> interactiveStates = <MaterialState>{
        MaterialState.pressed,
        MaterialState.hovered,
        MaterialState.focused,
      };
      if (states.any(interactiveStates.contains)) {
        return widget.tickColor;
      }
      return widget.boxColor;
    }

    return Transform.scale(
        scale: 0.85,
        child: Checkbox(
          checkColor: widget.tickColor,
          fillColor: MaterialStateProperty.resolveWith(getColor),
          value: CustomCheckbox.ischecked,
          onChanged: (bool? value) {
            setState(() {
              CustomCheckbox.ischecked = !CustomCheckbox.ischecked;
              widget.togglePACheckedFunction();
            });
          },
        ));
  }
}
