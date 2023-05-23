import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';

import 'package:supercellmates/locator.dart';
import 'package:supercellmates/router/router.dart';

void main() {
  setupLocator();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      child: MaterialApp.router(
        routerConfig: GetIt.I<AppRouter>().config(),
        title: 'SuperCellMates',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.lightBlue),
          useMaterial3: true,
        ),
      ),
      onWillPop: () async => false,
    );
  }
}
