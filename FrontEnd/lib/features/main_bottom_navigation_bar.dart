// import 'package:flutter/material.dart';

// import 'package:auto_route/auto_route.dart';
// import 'package:supercellmates/router/router.gr.dart';

// class MainBottomNavigationBar extends StatelessWidget {
//   MainBottomNavigationBar(Function update) {
//     updateIndex = update;
//   }

//   Function updateIndex = (value) => {};

//   @override
//   Widget build(BuildContext context) {
//     return BottomNavigationBar(items: [
//       BottomNavigationBarItem(
//         label: "home",
//         icon: IconButton(
//             icon: const Icon(Icons.home),
//             onPressed: () => AutoRouter.of(context).push(const HomeRoute())),
//       ),
//       BottomNavigationBarItem(
//           label: "chat",
//           icon: IconButton(
//               icon: const Icon(Icons.home),
//               onPressed: () => AutoRouter.of(context).push(const ChatRoute()))),
//       BottomNavigationBarItem(
//         label: "profile",
//         icon: IconButton(
//             icon: const Icon(Icons.home),
//             onPressed: () => AutoRouter.of(context).push(const ProfileRoute())),
//       )
//     ]);
//   }
// }
