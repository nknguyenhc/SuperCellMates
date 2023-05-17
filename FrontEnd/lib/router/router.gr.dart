// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i8;
import 'package:supercellmates/features/achievement.dart' as _i5;
import 'package:supercellmates/features/add_tag.dart' as _i7;
import 'package:supercellmates/features/friend_request.dart' as _i1;
import 'package:supercellmates/features/login.dart' as _i2;
import 'package:supercellmates/features/main_scaffold.dart' as _i3;
import 'package:supercellmates/features/privacy_agreement.dart' as _i4;
import 'package:supercellmates/features/settings.dart' as _i6;

abstract class $AppRouter extends _i8.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i8.PageFactory> pagesMap = {
    FriendRequestRoute.name: (routeData) {
      return _i8.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.FriendRequestPage(),
      );
    },
    LoginRoute.name: (routeData) {
      return _i8.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.LoginPage(),
      );
    },
    MainScaffold.name: (routeData) {
      return _i8.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i3.MainScaffold(),
      );
    },
    PrivacyAgreementRoute.name: (routeData) {
      return _i8.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.PrivacyAgreementPage(),
      );
    },
    AchievementRoute.name: (routeData) {
      return _i8.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i5.AchievementPage(),
      );
    },
    SettingsRoute.name: (routeData) {
      return _i8.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i6.SettingsPage(),
      );
    },
    AddTagRoute.name: (routeData) {
      return _i8.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i7.AddTagPage(),
      );
    },
  };
}

/// generated route for
/// [_i1.FriendRequestPage]
class FriendRequestRoute extends _i8.PageRouteInfo<void> {
  const FriendRequestRoute({List<_i8.PageRouteInfo>? children})
      : super(
          FriendRequestRoute.name,
          initialChildren: children,
        );

  static const String name = 'FriendRequestRoute';

  static const _i8.PageInfo<void> page = _i8.PageInfo<void>(name);
}

/// generated route for
/// [_i2.LoginPage]
class LoginRoute extends _i8.PageRouteInfo<void> {
  const LoginRoute({List<_i8.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i8.PageInfo<void> page = _i8.PageInfo<void>(name);
}

/// generated route for
/// [_i3.MainScaffold]
class MainScaffold extends _i8.PageRouteInfo<void> {
  const MainScaffold({List<_i8.PageRouteInfo>? children})
      : super(
          MainScaffold.name,
          initialChildren: children,
        );

  static const String name = 'MainScaffold';

  static const _i8.PageInfo<void> page = _i8.PageInfo<void>(name);
}

/// generated route for
/// [_i4.PrivacyAgreementPage]
class PrivacyAgreementRoute extends _i8.PageRouteInfo<void> {
  const PrivacyAgreementRoute({List<_i8.PageRouteInfo>? children})
      : super(
          PrivacyAgreementRoute.name,
          initialChildren: children,
        );

  static const String name = 'PrivacyAgreementRoute';

  static const _i8.PageInfo<void> page = _i8.PageInfo<void>(name);
}

/// generated route for
/// [_i5.AchievementPage]
class AchievementRoute extends _i8.PageRouteInfo<void> {
  const AchievementRoute({List<_i8.PageRouteInfo>? children})
      : super(
          AchievementRoute.name,
          initialChildren: children,
        );

  static const String name = 'AchievementRoute';

  static const _i8.PageInfo<void> page = _i8.PageInfo<void>(name);
}

/// generated route for
/// [_i6.SettingsPage]
class SettingsRoute extends _i8.PageRouteInfo<void> {
  const SettingsRoute({List<_i8.PageRouteInfo>? children})
      : super(
          SettingsRoute.name,
          initialChildren: children,
        );

  static const String name = 'SettingsRoute';

  static const _i8.PageInfo<void> page = _i8.PageInfo<void>(name);
}

/// generated route for
/// [_i7.AddTagPage]
class AddTagRoute extends _i8.PageRouteInfo<void> {
  const AddTagRoute({List<_i8.PageRouteInfo>? children})
      : super(
          AddTagRoute.name,
          initialChildren: children,
        );

  static const String name = 'AddTagRoute';

  static const _i8.PageInfo<void> page = _i8.PageInfo<void>(name);
}
