// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i3;
import 'package:supercellmates/features/friend_request.dart' as _i2;
import 'package:supercellmates/features/main_scaffold.dart' as _i1;

abstract class $AppRouter extends _i3.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i3.PageFactory> pagesMap = {
    MainScaffold.name: (routeData) {
      return _i3.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.MainScaffold(),
      );
    },
    FriendRequestRoute.name: (routeData) {
      return _i3.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.FriendRequestPage(),
      );
    },
  };
}

/// generated route for
/// [_i1.MainScaffold]
class MainScaffold extends _i3.PageRouteInfo<void> {
  const MainScaffold({List<_i3.PageRouteInfo>? children})
      : super(
          MainScaffold.name,
          initialChildren: children,
        );

  static const String name = 'MainScaffold';

  static const _i3.PageInfo<void> page = _i3.PageInfo<void>(name);
}

/// generated route for
/// [_i2.FriendRequestPage]
class FriendRequestRoute extends _i3.PageRouteInfo<void> {
  const FriendRequestRoute({List<_i3.PageRouteInfo>? children})
      : super(
          FriendRequestRoute.name,
          initialChildren: children,
        );

  static const String name = 'FriendRequestRoute';

  static const _i3.PageInfo<void> page = _i3.PageInfo<void>(name);
}
