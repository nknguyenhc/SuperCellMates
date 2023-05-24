// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i10;
import 'package:flutter/material.dart' as _i11;
import 'package:supercellmates/features/auth/login.dart' as _i1;
import 'package:supercellmates/features/auth/privacy_agreement.dart' as _i2;
import 'package:supercellmates/features/friends/friends.dart' as _i9;
import 'package:supercellmates/features/home/settings.dart' as _i3;
import 'package:supercellmates/features/main_scaffold.dart' as _i4;
import 'package:supercellmates/features/posts/create_post.dart' as _i5;
import 'package:supercellmates/features/profile/achievement.dart' as _i6;
import 'package:supercellmates/features/profile/add_tag.dart' as _i7;
import 'package:supercellmates/features/profile/edit_profile.dart' as _i8;

abstract class $AppRouter extends _i10.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i10.PageFactory> pagesMap = {
    LoginRoute.name: (routeData) {
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.LoginPage(),
      );
    },
    PrivacyAgreementRoute.name: (routeData) {
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.PrivacyAgreementPage(),
      );
    },
    SettingsRoute.name: (routeData) {
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i3.SettingsPage(),
      );
    },
    MainScaffold.name: (routeData) {
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.MainScaffold(),
      );
    },
    CreatePostRoute.name: (routeData) {
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i5.CreatePostPage(),
      );
    },
    AchievementRoute.name: (routeData) {
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i6.AchievementPage(),
      );
    },
    AddTagRoute.name: (routeData) {
      final args = routeData.argsAs<AddTagRouteArgs>();
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i7.AddTagPage(
          key: args.key,
          updateCallBack: args.updateCallBack,
        ),
      );
    },
    EditProfileRoute.name: (routeData) {
      final args = routeData.argsAs<EditProfileRouteArgs>();
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i8.EditProfilePage(
          key: args.key,
          callBack: args.callBack,
        ),
      );
    },
    FriendsRoute.name: (routeData) {
      return _i10.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i9.FriendsPage(),
      );
    },
  };
}

/// generated route for
/// [_i1.LoginPage]
class LoginRoute extends _i10.PageRouteInfo<void> {
  const LoginRoute({List<_i10.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i10.PageInfo<void> page = _i10.PageInfo<void>(name);
}

/// generated route for
/// [_i2.PrivacyAgreementPage]
class PrivacyAgreementRoute extends _i10.PageRouteInfo<void> {
  const PrivacyAgreementRoute({List<_i10.PageRouteInfo>? children})
      : super(
          PrivacyAgreementRoute.name,
          initialChildren: children,
        );

  static const String name = 'PrivacyAgreementRoute';

  static const _i10.PageInfo<void> page = _i10.PageInfo<void>(name);
}

/// generated route for
/// [_i3.SettingsPage]
class SettingsRoute extends _i10.PageRouteInfo<void> {
  const SettingsRoute({List<_i10.PageRouteInfo>? children})
      : super(
          SettingsRoute.name,
          initialChildren: children,
        );

  static const String name = 'SettingsRoute';

  static const _i10.PageInfo<void> page = _i10.PageInfo<void>(name);
}

/// generated route for
/// [_i4.MainScaffold]
class MainScaffold extends _i10.PageRouteInfo<void> {
  const MainScaffold({List<_i10.PageRouteInfo>? children})
      : super(
          MainScaffold.name,
          initialChildren: children,
        );

  static const String name = 'MainScaffold';

  static const _i10.PageInfo<void> page = _i10.PageInfo<void>(name);
}

/// generated route for
/// [_i5.CreatePostPage]
class CreatePostRoute extends _i10.PageRouteInfo<void> {
  const CreatePostRoute({List<_i10.PageRouteInfo>? children})
      : super(
          CreatePostRoute.name,
          initialChildren: children,
        );

  static const String name = 'CreatePostRoute';

  static const _i10.PageInfo<void> page = _i10.PageInfo<void>(name);
}

/// generated route for
/// [_i6.AchievementPage]
class AchievementRoute extends _i10.PageRouteInfo<void> {
  const AchievementRoute({List<_i10.PageRouteInfo>? children})
      : super(
          AchievementRoute.name,
          initialChildren: children,
        );

  static const String name = 'AchievementRoute';

  static const _i10.PageInfo<void> page = _i10.PageInfo<void>(name);
}

/// generated route for
/// [_i7.AddTagPage]
class AddTagRoute extends _i10.PageRouteInfo<AddTagRouteArgs> {
  AddTagRoute({
    _i11.Key? key,
    required dynamic updateCallBack,
    List<_i10.PageRouteInfo>? children,
  }) : super(
          AddTagRoute.name,
          args: AddTagRouteArgs(
            key: key,
            updateCallBack: updateCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'AddTagRoute';

  static const _i10.PageInfo<AddTagRouteArgs> page =
      _i10.PageInfo<AddTagRouteArgs>(name);
}

class AddTagRouteArgs {
  const AddTagRouteArgs({
    this.key,
    required this.updateCallBack,
  });

  final _i11.Key? key;

  final dynamic updateCallBack;

  @override
  String toString() {
    return 'AddTagRouteArgs{key: $key, updateCallBack: $updateCallBack}';
  }
}

/// generated route for
/// [_i8.EditProfilePage]
class EditProfileRoute extends _i10.PageRouteInfo<EditProfileRouteArgs> {
  EditProfileRoute({
    _i11.Key? key,
    required dynamic callBack,
    List<_i10.PageRouteInfo>? children,
  }) : super(
          EditProfileRoute.name,
          args: EditProfileRouteArgs(
            key: key,
            callBack: callBack,
          ),
          initialChildren: children,
        );

  static const String name = 'EditProfileRoute';

  static const _i10.PageInfo<EditProfileRouteArgs> page =
      _i10.PageInfo<EditProfileRouteArgs>(name);
}

class EditProfileRouteArgs {
  const EditProfileRouteArgs({
    this.key,
    required this.callBack,
  });

  final _i11.Key? key;

  final dynamic callBack;

  @override
  String toString() {
    return 'EditProfileRouteArgs{key: $key, callBack: $callBack}';
  }
}

/// generated route for
/// [_i9.FriendsPage]
class FriendsRoute extends _i10.PageRouteInfo<void> {
  const FriendsRoute({List<_i10.PageRouteInfo>? children})
      : super(
          FriendsRoute.name,
          initialChildren: children,
        );

  static const String name = 'FriendsRoute';

  static const _i10.PageInfo<void> page = _i10.PageInfo<void>(name);
}
