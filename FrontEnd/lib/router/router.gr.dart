// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i12;
import 'package:flutter/material.dart' as _i13;
import 'package:supercellmates/features/auth/login.dart' as _i1;
import 'package:supercellmates/features/auth/privacy_agreement.dart' as _i2;
import 'package:supercellmates/features/friends/friends.dart' as _i3;
import 'package:supercellmates/features/home/settings.dart' as _i4;
import 'package:supercellmates/features/main_scaffold.dart' as _i5;
import 'package:supercellmates/features/posts/create_post.dart' as _i6;
import 'package:supercellmates/features/profile/achievement.dart' as _i7;
import 'package:supercellmates/features/profile/add_tag.dart' as _i8;
import 'package:supercellmates/features/profile/edit_profile.dart' as _i9;
import 'package:supercellmates/features/profile/others_profile.dart' as _i10;
import 'package:supercellmates/features/profile/request_tag.dart' as _i11;

abstract class $AppRouter extends _i12.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i12.PageFactory> pagesMap = {
    LoginRoute.name: (routeData) {
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.LoginPage(),
      );
    },
    PrivacyAgreementRoute.name: (routeData) {
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.PrivacyAgreementPage(),
      );
    },
    FriendsRoute.name: (routeData) {
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i3.FriendsPage(),
      );
    },
    SettingsRoute.name: (routeData) {
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.SettingsPage(),
      );
    },
    MainScaffold.name: (routeData) {
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i5.MainScaffold(),
      );
    },
    CreatePostRoute.name: (routeData) {
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i6.CreatePostPage(),
      );
    },
    AchievementRoute.name: (routeData) {
      final args = routeData.argsAs<AchievementRouteArgs>();
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i7.AchievementPage(
          key: args.key,
          name: args.name,
          myProfile: args.myProfile,
        ),
      );
    },
    AddTagRoute.name: (routeData) {
      final args = routeData.argsAs<AddTagRouteArgs>();
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i8.AddTagPage(
          key: args.key,
          updateCallBack: args.updateCallBack,
        ),
      );
    },
    EditProfileRoute.name: (routeData) {
      final args = routeData.argsAs<EditProfileRouteArgs>();
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i9.EditProfilePage(
          key: args.key,
          callBack: args.callBack,
        ),
      );
    },
    OthersProfileRoute.name: (routeData) {
      final args = routeData.argsAs<OthersProfileRouteArgs>();
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i10.OthersProfilePage(
          key: args.key,
          data: args.data,
        ),
      );
    },
    RequestTagRoute.name: (routeData) {
      return _i12.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i11.RequestTagPage(),
      );
    },
  };
}

/// generated route for
/// [_i1.LoginPage]
class LoginRoute extends _i12.PageRouteInfo<void> {
  const LoginRoute({List<_i12.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i12.PageInfo<void> page = _i12.PageInfo<void>(name);
}

/// generated route for
/// [_i2.PrivacyAgreementPage]
class PrivacyAgreementRoute extends _i12.PageRouteInfo<void> {
  const PrivacyAgreementRoute({List<_i12.PageRouteInfo>? children})
      : super(
          PrivacyAgreementRoute.name,
          initialChildren: children,
        );

  static const String name = 'PrivacyAgreementRoute';

  static const _i12.PageInfo<void> page = _i12.PageInfo<void>(name);
}

/// generated route for
/// [_i3.FriendsPage]
class FriendsRoute extends _i12.PageRouteInfo<void> {
  const FriendsRoute({List<_i12.PageRouteInfo>? children})
      : super(
          FriendsRoute.name,
          initialChildren: children,
        );

  static const String name = 'FriendsRoute';

  static const _i12.PageInfo<void> page = _i12.PageInfo<void>(name);
}

/// generated route for
/// [_i4.SettingsPage]
class SettingsRoute extends _i12.PageRouteInfo<void> {
  const SettingsRoute({List<_i12.PageRouteInfo>? children})
      : super(
          SettingsRoute.name,
          initialChildren: children,
        );

  static const String name = 'SettingsRoute';

  static const _i12.PageInfo<void> page = _i12.PageInfo<void>(name);
}

/// generated route for
/// [_i5.MainScaffold]
class MainScaffold extends _i12.PageRouteInfo<void> {
  const MainScaffold({List<_i12.PageRouteInfo>? children})
      : super(
          MainScaffold.name,
          initialChildren: children,
        );

  static const String name = 'MainScaffold';

  static const _i12.PageInfo<void> page = _i12.PageInfo<void>(name);
}

/// generated route for
/// [_i6.CreatePostPage]
class CreatePostRoute extends _i12.PageRouteInfo<void> {
  const CreatePostRoute({List<_i12.PageRouteInfo>? children})
      : super(
          CreatePostRoute.name,
          initialChildren: children,
        );

  static const String name = 'CreatePostRoute';

  static const _i12.PageInfo<void> page = _i12.PageInfo<void>(name);
}

/// generated route for
/// [_i7.AchievementPage]
class AchievementRoute extends _i12.PageRouteInfo<AchievementRouteArgs> {
  AchievementRoute({
    _i13.Key? key,
    required String name,
    required bool myProfile,
    List<_i12.PageRouteInfo>? children,
  }) : super(
          AchievementRoute.name,
          args: AchievementRouteArgs(
            key: key,
            name: name,
            myProfile: myProfile,
          ),
          initialChildren: children,
        );

  static const String name = 'AchievementRoute';

  static const _i12.PageInfo<AchievementRouteArgs> page =
      _i12.PageInfo<AchievementRouteArgs>(name);
}

class AchievementRouteArgs {
  const AchievementRouteArgs({
    this.key,
    required this.name,
    required this.myProfile,
  });

  final _i13.Key? key;

  final String name;

  final bool myProfile;

  @override
  String toString() {
    return 'AchievementRouteArgs{key: $key, name: $name, myProfile: $myProfile}';
  }
}

/// generated route for
/// [_i8.AddTagPage]
class AddTagRoute extends _i12.PageRouteInfo<AddTagRouteArgs> {
  AddTagRoute({
    _i13.Key? key,
    required dynamic updateCallBack,
    List<_i12.PageRouteInfo>? children,
  }) : super(
          AddTagRoute.name,
          args: AddTagRouteArgs(
            key: key,
            updateCallBack: updateCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'AddTagRoute';

  static const _i12.PageInfo<AddTagRouteArgs> page =
      _i12.PageInfo<AddTagRouteArgs>(name);
}

class AddTagRouteArgs {
  const AddTagRouteArgs({
    this.key,
    required this.updateCallBack,
  });

  final _i13.Key? key;

  final dynamic updateCallBack;

  @override
  String toString() {
    return 'AddTagRouteArgs{key: $key, updateCallBack: $updateCallBack}';
  }
}

/// generated route for
/// [_i9.EditProfilePage]
class EditProfileRoute extends _i12.PageRouteInfo<EditProfileRouteArgs> {
  EditProfileRoute({
    _i13.Key? key,
    required dynamic callBack,
    List<_i12.PageRouteInfo>? children,
  }) : super(
          EditProfileRoute.name,
          args: EditProfileRouteArgs(
            key: key,
            callBack: callBack,
          ),
          initialChildren: children,
        );

  static const String name = 'EditProfileRoute';

  static const _i12.PageInfo<EditProfileRouteArgs> page =
      _i12.PageInfo<EditProfileRouteArgs>(name);
}

class EditProfileRouteArgs {
  const EditProfileRouteArgs({
    this.key,
    required this.callBack,
  });

  final _i13.Key? key;

  final dynamic callBack;

  @override
  String toString() {
    return 'EditProfileRouteArgs{key: $key, callBack: $callBack}';
  }
}

/// generated route for
/// [_i10.OthersProfilePage]
class OthersProfileRoute extends _i12.PageRouteInfo<OthersProfileRouteArgs> {
  OthersProfileRoute({
    _i13.Key? key,
    required dynamic data,
    List<_i12.PageRouteInfo>? children,
  }) : super(
          OthersProfileRoute.name,
          args: OthersProfileRouteArgs(
            key: key,
            data: data,
          ),
          initialChildren: children,
        );

  static const String name = 'OthersProfileRoute';

  static const _i12.PageInfo<OthersProfileRouteArgs> page =
      _i12.PageInfo<OthersProfileRouteArgs>(name);
}

class OthersProfileRouteArgs {
  const OthersProfileRouteArgs({
    this.key,
    required this.data,
  });

  final _i13.Key? key;

  final dynamic data;

  @override
  String toString() {
    return 'OthersProfileRouteArgs{key: $key, data: $data}';
  }
}

/// generated route for
/// [_i11.RequestTagPage]
class RequestTagRoute extends _i12.PageRouteInfo<void> {
  const RequestTagRoute({List<_i12.PageRouteInfo>? children})
      : super(
          RequestTagRoute.name,
          initialChildren: children,
        );

  static const String name = 'RequestTagRoute';

  static const _i12.PageInfo<void> page = _i12.PageInfo<void>(name);
}
