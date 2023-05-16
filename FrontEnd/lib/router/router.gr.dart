// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i5;
import 'package:flutter/material.dart' as _i6;
import 'package:supercellmates/features/friend_request.dart' as _i1;
import 'package:supercellmates/features/login.dart' as _i2;
import 'package:supercellmates/features/main_scaffold.dart' as _i3;
import 'package:supercellmates/features/privacy_agreement.dart' as _i4;

abstract class $AppRouter extends _i5.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i5.PageFactory> pagesMap = {
    FriendRequestRoute.name: (routeData) {
      return _i5.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.FriendRequestPage(),
      );
    },
    LoginRoute.name: (routeData) {
      final args = routeData.argsAs<LoginRouteArgs>(
          orElse: () => const LoginRouteArgs());
      return _i5.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i2.LoginPage(key: args.key),
      );
    },
    MainScaffold.name: (routeData) {
      return _i5.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i3.MainScaffold(),
      );
    },
    PrivacyAgreementRoute.name: (routeData) {
      return _i5.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.PrivacyAgreementPage(),
      );
    },
  };
}

/// generated route for
/// [_i1.FriendRequestPage]
class FriendRequestRoute extends _i5.PageRouteInfo<void> {
  const FriendRequestRoute({List<_i5.PageRouteInfo>? children})
      : super(
          FriendRequestRoute.name,
          initialChildren: children,
        );

  static const String name = 'FriendRequestRoute';

  static const _i5.PageInfo<void> page = _i5.PageInfo<void>(name);
}

/// generated route for
/// [_i2.LoginPage]
class LoginRoute extends _i5.PageRouteInfo<LoginRouteArgs> {
  LoginRoute({
    _i6.Key? key,
    List<_i5.PageRouteInfo>? children,
  }) : super(
          LoginRoute.name,
          args: LoginRouteArgs(key: key),
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i5.PageInfo<LoginRouteArgs> page =
      _i5.PageInfo<LoginRouteArgs>(name);
}

class LoginRouteArgs {
  const LoginRouteArgs({this.key});

  final _i6.Key? key;

  @override
  String toString() {
    return 'LoginRouteArgs{key: $key}';
  }
}

/// generated route for
/// [_i3.MainScaffold]
class MainScaffold extends _i5.PageRouteInfo<void> {
  const MainScaffold({List<_i5.PageRouteInfo>? children})
      : super(
          MainScaffold.name,
          initialChildren: children,
        );

  static const String name = 'MainScaffold';

  static const _i5.PageInfo<void> page = _i5.PageInfo<void>(name);
}

/// generated route for
/// [_i4.PrivacyAgreementPage]
class PrivacyAgreementRoute extends _i5.PageRouteInfo<void> {
  const PrivacyAgreementRoute({List<_i5.PageRouteInfo>? children})
      : super(
          PrivacyAgreementRoute.name,
          initialChildren: children,
        );

  static const String name = 'PrivacyAgreementRoute';

  static const _i5.PageInfo<void> page = _i5.PageInfo<void>(name);
}
