import 'package:flutter/material.dart';

bool customCheckboxChecked = false;

class CustomCheckbox extends StatefulWidget {
  const CustomCheckbox({required this.togglePACheckedFunction, super.key});

  final Function() togglePACheckedFunction;

  @override
  State<CustomCheckbox> createState() => _CustomCheckboxState();
}

class _CustomCheckboxState extends State<CustomCheckbox> {
  bool isChecked = false;

  @override
  Widget build(BuildContext context) {
    Color getColor(Set<MaterialState> states) {
      const Set<MaterialState> interactiveStates = <MaterialState>{
        MaterialState.pressed,
        MaterialState.hovered,
        MaterialState.focused,
      };
      if (states.any(interactiveStates.contains)) {
        return Colors.blue;
      }
      return Colors.white;
    }

    return Transform.scale(
        scale: 0.85,
        child: Checkbox(
          checkColor: Colors.blue,
          fillColor: MaterialStateProperty.resolveWith(getColor),
          value: isChecked,
          onChanged: (bool? value) {
            setState(() {
              isChecked = value!;
              widget.togglePACheckedFunction();
            });
          },
        ));
  }
}
