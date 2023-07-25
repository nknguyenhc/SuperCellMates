// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'dart:typed_data' as _i23;

import 'package:auto_route/auto_route.dart' as _i21;
import 'package:flutter/material.dart' as _i22;
import 'package:supercellmates/features/auth/login.dart' as _i1;
import 'package:supercellmates/features/auth/privacy_agreement.dart' as _i2;
import 'package:supercellmates/features/chat/chat_room_page.dart' as _i3;
import 'package:supercellmates/features/chat/create_group_page.dart' as _i4;
import 'package:supercellmates/features/chat/group_chat_invite_friend.dart'
    as _i5;
import 'package:supercellmates/features/chat/group_chat_settings.dart' as _i6;
import 'package:supercellmates/features/friends/friends.dart' as _i7;
import 'package:supercellmates/features/home/settings.dart' as _i8;
import 'package:supercellmates/features/main_scaffold.dart' as _i9;
import 'package:supercellmates/features/posts/create_post.dart' as _i10;
import 'package:supercellmates/features/profile/achievement.dart' as _i11;
import 'package:supercellmates/features/profile/add_tag.dart' as _i12;
import 'package:supercellmates/features/profile/change_name.dart' as _i13;
import 'package:supercellmates/features/profile/change_password.dart' as _i14;
import 'package:supercellmates/features/profile/change_username.dart' as _i15;
import 'package:supercellmates/features/profile/edit_profile.dart' as _i16;
import 'package:supercellmates/features/profile/others_profile.dart' as _i17;
import 'package:supercellmates/features/profile/request_tag.dart' as _i18;
import 'package:supercellmates/functions/multiple_photos_viewer.dart' as _i19;
import 'package:supercellmates/functions/single_photo_viewer.dart' as _i20;

abstract class $AppRouter extends _i21.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i21.PageFactory> pagesMap = {
    LoginRoute.name: (routeData) {
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.LoginPage(),
      );
    },
    PrivacyAgreementRoute.name: (routeData) {
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.PrivacyAgreementPage(),
      );
    },
    ChatRoomRoute.name: (routeData) {
      final args = routeData.argsAs<ChatRoomRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i3.ChatRoomPage(
          key: args.key,
          username: args.username,
          chatInfo: args.chatInfo,
          isPrivate: args.isPrivate,
        ),
      );
    },
    CreateGroupRoute.name: (routeData) {
      final args = routeData.argsAs<CreateGroupRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i4.CreateGroupPage(
          key: args.key,
          updateCallBack: args.updateCallBack,
        ),
      );
    },
    GroupChatInviteFriendRoute.name: (routeData) {
      final args = routeData.argsAs<GroupChatInviteFriendRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i5.GroupChatInviteFriendPage(
          key: args.key,
          chatInfo: args.chatInfo,
          currMembers: args.currMembers,
          updateCallBack: args.updateCallBack,
        ),
      );
    },
    GroupChatSettingsRoute.name: (routeData) {
      final args = routeData.argsAs<GroupChatSettingsRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i6.GroupChatSettingsPage(
          key: args.key,
          chatInfo: args.chatInfo,
          username: args.username,
        ),
      );
    },
    FriendsRoute.name: (routeData) {
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i7.FriendsPage(),
      );
    },
    SettingsRoute.name: (routeData) {
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i8.SettingsPage(),
      );
    },
    MainScaffold.name: (routeData) {
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i9.MainScaffold(),
      );
    },
    CreatePostRoute.name: (routeData) {
      final args = routeData.argsAs<CreatePostRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i10.CreatePostPage(
          key: args.key,
          isEdit: args.isEdit,
          tagName: args.tagName,
          updateCallBack: args.updateCallBack,
          oldPostData: args.oldPostData,
          oldPostImages: args.oldPostImages,
        ),
      );
    },
    AchievementRoute.name: (routeData) {
      final args = routeData.argsAs<AchievementRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i11.AchievementPage(
          key: args.key,
          name: args.name,
          myProfile: args.myProfile,
        ),
      );
    },
    AddTagRoute.name: (routeData) {
      final args = routeData.argsAs<AddTagRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i12.AddTagPage(
          key: args.key,
          updateCallBack: args.updateCallBack,
        ),
      );
    },
    ChangeNameRoute.name: (routeData) {
      final args = routeData.argsAs<ChangeNameRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i13.ChangeNamePage(
          key: args.key,
          updateProfileMapCallBack: args.updateProfileMapCallBack,
        ),
      );
    },
    ChangePasswordRoute.name: (routeData) {
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i14.ChangePasswordPage(),
      );
    },
    ChangeUsernameRoute.name: (routeData) {
      final args = routeData.argsAs<ChangeUsernameRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i15.ChangeUsernamePage(
          key: args.key,
          updateProfileMapCallBack: args.updateProfileMapCallBack,
        ),
      );
    },
    EditProfileRoute.name: (routeData) {
      final args = routeData.argsAs<EditProfileRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i16.EditProfilePage(
          key: args.key,
          updateProfileImageCallBack: args.updateProfileImageCallBack,
          updateProfileMapCallBack: args.updateProfileMapCallBack,
        ),
      );
    },
    OthersProfileRoute.name: (routeData) {
      final args = routeData.argsAs<OthersProfileRouteArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i17.OthersProfilePage(
          key: args.key,
          username: args.username,
          onDeleteFriendCallBack: args.onDeleteFriendCallBack,
        ),
      );
    },
    RequestTagRoute.name: (routeData) {
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i18.RequestTagPage(),
      );
    },
    MultiplePhotosViewer.name: (routeData) {
      final args = routeData.argsAs<MultiplePhotosViewerArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i19.MultiplePhotosViewer(
          key: args.key,
          listOfPhotoBytes: args.listOfPhotoBytes,
          initialIndex: args.initialIndex,
          actionFunction: args.actionFunction,
        ),
      );
    },
    SinglePhotoViewer.name: (routeData) {
      final args = routeData.argsAs<SinglePhotoViewerArgs>();
      return _i21.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i20.SinglePhotoViewer(
          key: args.key,
          photoBytes: args.photoBytes,
          actions: args.actions,
        ),
      );
    },
  };
}

/// generated route for
/// [_i1.LoginPage]
class LoginRoute extends _i21.PageRouteInfo<void> {
  const LoginRoute({List<_i21.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i21.PageInfo<void> page = _i21.PageInfo<void>(name);
}

/// generated route for
/// [_i2.PrivacyAgreementPage]
class PrivacyAgreementRoute extends _i21.PageRouteInfo<void> {
  const PrivacyAgreementRoute({List<_i21.PageRouteInfo>? children})
      : super(
          PrivacyAgreementRoute.name,
          initialChildren: children,
        );

  static const String name = 'PrivacyAgreementRoute';

  static const _i21.PageInfo<void> page = _i21.PageInfo<void>(name);
}

/// generated route for
/// [_i3.ChatRoomPage]
class ChatRoomRoute extends _i21.PageRouteInfo<ChatRoomRouteArgs> {
  ChatRoomRoute({
    _i22.Key? key,
    required String username,
    required dynamic chatInfo,
    required bool isPrivate,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          ChatRoomRoute.name,
          args: ChatRoomRouteArgs(
            key: key,
            username: username,
            chatInfo: chatInfo,
            isPrivate: isPrivate,
          ),
          initialChildren: children,
        );

  static const String name = 'ChatRoomRoute';

  static const _i21.PageInfo<ChatRoomRouteArgs> page =
      _i21.PageInfo<ChatRoomRouteArgs>(name);
}

class ChatRoomRouteArgs {
  const ChatRoomRouteArgs({
    this.key,
    required this.username,
    required this.chatInfo,
    required this.isPrivate,
  });

  final _i22.Key? key;

  final String username;

  final dynamic chatInfo;

  final bool isPrivate;

  @override
  String toString() {
    return 'ChatRoomRouteArgs{key: $key, username: $username, chatInfo: $chatInfo, isPrivate: $isPrivate}';
  }
}

/// generated route for
/// [_i4.CreateGroupPage]
class CreateGroupRoute extends _i21.PageRouteInfo<CreateGroupRouteArgs> {
  CreateGroupRoute({
    _i22.Key? key,
    required dynamic updateCallBack,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          CreateGroupRoute.name,
          args: CreateGroupRouteArgs(
            key: key,
            updateCallBack: updateCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'CreateGroupRoute';

  static const _i21.PageInfo<CreateGroupRouteArgs> page =
      _i21.PageInfo<CreateGroupRouteArgs>(name);
}

class CreateGroupRouteArgs {
  const CreateGroupRouteArgs({
    this.key,
    required this.updateCallBack,
  });

  final _i22.Key? key;

  final dynamic updateCallBack;

  @override
  String toString() {
    return 'CreateGroupRouteArgs{key: $key, updateCallBack: $updateCallBack}';
  }
}

/// generated route for
/// [_i5.GroupChatInviteFriendPage]
class GroupChatInviteFriendRoute
    extends _i21.PageRouteInfo<GroupChatInviteFriendRouteArgs> {
  GroupChatInviteFriendRoute({
    _i22.Key? key,
    required dynamic chatInfo,
    required List<dynamic> currMembers,
    required dynamic updateCallBack,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          GroupChatInviteFriendRoute.name,
          args: GroupChatInviteFriendRouteArgs(
            key: key,
            chatInfo: chatInfo,
            currMembers: currMembers,
            updateCallBack: updateCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'GroupChatInviteFriendRoute';

  static const _i21.PageInfo<GroupChatInviteFriendRouteArgs> page =
      _i21.PageInfo<GroupChatInviteFriendRouteArgs>(name);
}

class GroupChatInviteFriendRouteArgs {
  const GroupChatInviteFriendRouteArgs({
    this.key,
    required this.chatInfo,
    required this.currMembers,
    required this.updateCallBack,
  });

  final _i22.Key? key;

  final dynamic chatInfo;

  final List<dynamic> currMembers;

  final dynamic updateCallBack;

  @override
  String toString() {
    return 'GroupChatInviteFriendRouteArgs{key: $key, chatInfo: $chatInfo, currMembers: $currMembers, updateCallBack: $updateCallBack}';
  }
}

/// generated route for
/// [_i6.GroupChatSettingsPage]
class GroupChatSettingsRoute
    extends _i21.PageRouteInfo<GroupChatSettingsRouteArgs> {
  GroupChatSettingsRoute({
    _i22.Key? key,
    required dynamic chatInfo,
    required String username,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          GroupChatSettingsRoute.name,
          args: GroupChatSettingsRouteArgs(
            key: key,
            chatInfo: chatInfo,
            username: username,
          ),
          initialChildren: children,
        );

  static const String name = 'GroupChatSettingsRoute';

  static const _i21.PageInfo<GroupChatSettingsRouteArgs> page =
      _i21.PageInfo<GroupChatSettingsRouteArgs>(name);
}

class GroupChatSettingsRouteArgs {
  const GroupChatSettingsRouteArgs({
    this.key,
    required this.chatInfo,
    required this.username,
  });

  final _i22.Key? key;

  final dynamic chatInfo;

  final String username;

  @override
  String toString() {
    return 'GroupChatSettingsRouteArgs{key: $key, chatInfo: $chatInfo, username: $username}';
  }
}

/// generated route for
/// [_i7.FriendsPage]
class FriendsRoute extends _i21.PageRouteInfo<void> {
  const FriendsRoute({List<_i21.PageRouteInfo>? children})
      : super(
          FriendsRoute.name,
          initialChildren: children,
        );

  static const String name = 'FriendsRoute';

  static const _i21.PageInfo<void> page = _i21.PageInfo<void>(name);
}

/// generated route for
/// [_i8.SettingsPage]
class SettingsRoute extends _i21.PageRouteInfo<void> {
  const SettingsRoute({List<_i21.PageRouteInfo>? children})
      : super(
          SettingsRoute.name,
          initialChildren: children,
        );

  static const String name = 'SettingsRoute';

  static const _i21.PageInfo<void> page = _i21.PageInfo<void>(name);
}

/// generated route for
/// [_i9.MainScaffold]
class MainScaffold extends _i21.PageRouteInfo<void> {
  const MainScaffold({List<_i21.PageRouteInfo>? children})
      : super(
          MainScaffold.name,
          initialChildren: children,
        );

  static const String name = 'MainScaffold';

  static const _i21.PageInfo<void> page = _i21.PageInfo<void>(name);
}

/// generated route for
/// [_i10.CreatePostPage]
class CreatePostRoute extends _i21.PageRouteInfo<CreatePostRouteArgs> {
  CreatePostRoute({
    _i22.Key? key,
    required bool isEdit,
    required String tagName,
    required dynamic updateCallBack,
    dynamic oldPostData,
    dynamic oldPostImages,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          CreatePostRoute.name,
          args: CreatePostRouteArgs(
            key: key,
            isEdit: isEdit,
            tagName: tagName,
            updateCallBack: updateCallBack,
            oldPostData: oldPostData,
            oldPostImages: oldPostImages,
          ),
          initialChildren: children,
        );

  static const String name = 'CreatePostRoute';

  static const _i21.PageInfo<CreatePostRouteArgs> page =
      _i21.PageInfo<CreatePostRouteArgs>(name);
}

class CreatePostRouteArgs {
  const CreatePostRouteArgs({
    this.key,
    required this.isEdit,
    required this.tagName,
    required this.updateCallBack,
    this.oldPostData,
    this.oldPostImages,
  });

  final _i22.Key? key;

  final bool isEdit;

  final String tagName;

  final dynamic updateCallBack;

  final dynamic oldPostData;

  final dynamic oldPostImages;

  @override
  String toString() {
    return 'CreatePostRouteArgs{key: $key, isEdit: $isEdit, tagName: $tagName, updateCallBack: $updateCallBack, oldPostData: $oldPostData, oldPostImages: $oldPostImages}';
  }
}

/// generated route for
/// [_i11.AchievementPage]
class AchievementRoute extends _i21.PageRouteInfo<AchievementRouteArgs> {
  AchievementRoute({
    _i22.Key? key,
    required String name,
    required bool myProfile,
    List<_i21.PageRouteInfo>? children,
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

  static const _i21.PageInfo<AchievementRouteArgs> page =
      _i21.PageInfo<AchievementRouteArgs>(name);
}

class AchievementRouteArgs {
  const AchievementRouteArgs({
    this.key,
    required this.name,
    required this.myProfile,
  });

  final _i22.Key? key;

  final String name;

  final bool myProfile;

  @override
  String toString() {
    return 'AchievementRouteArgs{key: $key, name: $name, myProfile: $myProfile}';
  }
}

/// generated route for
/// [_i12.AddTagPage]
class AddTagRoute extends _i21.PageRouteInfo<AddTagRouteArgs> {
  AddTagRoute({
    _i22.Key? key,
    required dynamic updateCallBack,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          AddTagRoute.name,
          args: AddTagRouteArgs(
            key: key,
            updateCallBack: updateCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'AddTagRoute';

  static const _i21.PageInfo<AddTagRouteArgs> page =
      _i21.PageInfo<AddTagRouteArgs>(name);
}

class AddTagRouteArgs {
  const AddTagRouteArgs({
    this.key,
    required this.updateCallBack,
  });

  final _i22.Key? key;

  final dynamic updateCallBack;

  @override
  String toString() {
    return 'AddTagRouteArgs{key: $key, updateCallBack: $updateCallBack}';
  }
}

/// generated route for
/// [_i13.ChangeNamePage]
class ChangeNameRoute extends _i21.PageRouteInfo<ChangeNameRouteArgs> {
  ChangeNameRoute({
    _i22.Key? key,
    required dynamic updateProfileMapCallBack,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          ChangeNameRoute.name,
          args: ChangeNameRouteArgs(
            key: key,
            updateProfileMapCallBack: updateProfileMapCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'ChangeNameRoute';

  static const _i21.PageInfo<ChangeNameRouteArgs> page =
      _i21.PageInfo<ChangeNameRouteArgs>(name);
}

class ChangeNameRouteArgs {
  const ChangeNameRouteArgs({
    this.key,
    required this.updateProfileMapCallBack,
  });

  final _i22.Key? key;

  final dynamic updateProfileMapCallBack;

  @override
  String toString() {
    return 'ChangeNameRouteArgs{key: $key, updateProfileMapCallBack: $updateProfileMapCallBack}';
  }
}

/// generated route for
/// [_i14.ChangePasswordPage]
class ChangePasswordRoute extends _i21.PageRouteInfo<void> {
  const ChangePasswordRoute({List<_i21.PageRouteInfo>? children})
      : super(
          ChangePasswordRoute.name,
          initialChildren: children,
        );

  static const String name = 'ChangePasswordRoute';

  static const _i21.PageInfo<void> page = _i21.PageInfo<void>(name);
}

/// generated route for
/// [_i15.ChangeUsernamePage]
class ChangeUsernameRoute extends _i21.PageRouteInfo<ChangeUsernameRouteArgs> {
  ChangeUsernameRoute({
    _i22.Key? key,
    required dynamic updateProfileMapCallBack,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          ChangeUsernameRoute.name,
          args: ChangeUsernameRouteArgs(
            key: key,
            updateProfileMapCallBack: updateProfileMapCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'ChangeUsernameRoute';

  static const _i21.PageInfo<ChangeUsernameRouteArgs> page =
      _i21.PageInfo<ChangeUsernameRouteArgs>(name);
}

class ChangeUsernameRouteArgs {
  const ChangeUsernameRouteArgs({
    this.key,
    required this.updateProfileMapCallBack,
  });

  final _i22.Key? key;

  final dynamic updateProfileMapCallBack;

  @override
  String toString() {
    return 'ChangeUsernameRouteArgs{key: $key, updateProfileMapCallBack: $updateProfileMapCallBack}';
  }
}

/// generated route for
/// [_i16.EditProfilePage]
class EditProfileRoute extends _i21.PageRouteInfo<EditProfileRouteArgs> {
  EditProfileRoute({
    _i22.Key? key,
    required dynamic updateProfileImageCallBack,
    required dynamic updateProfileMapCallBack,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          EditProfileRoute.name,
          args: EditProfileRouteArgs(
            key: key,
            updateProfileImageCallBack: updateProfileImageCallBack,
            updateProfileMapCallBack: updateProfileMapCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'EditProfileRoute';

  static const _i21.PageInfo<EditProfileRouteArgs> page =
      _i21.PageInfo<EditProfileRouteArgs>(name);
}

class EditProfileRouteArgs {
  const EditProfileRouteArgs({
    this.key,
    required this.updateProfileImageCallBack,
    required this.updateProfileMapCallBack,
  });

  final _i22.Key? key;

  final dynamic updateProfileImageCallBack;

  final dynamic updateProfileMapCallBack;

  @override
  String toString() {
    return 'EditProfileRouteArgs{key: $key, updateProfileImageCallBack: $updateProfileImageCallBack, updateProfileMapCallBack: $updateProfileMapCallBack}';
  }
}

/// generated route for
/// [_i17.OthersProfilePage]
class OthersProfileRoute extends _i21.PageRouteInfo<OthersProfileRouteArgs> {
  OthersProfileRoute({
    _i22.Key? key,
    required String username,
    dynamic onDeleteFriendCallBack,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          OthersProfileRoute.name,
          args: OthersProfileRouteArgs(
            key: key,
            username: username,
            onDeleteFriendCallBack: onDeleteFriendCallBack,
          ),
          initialChildren: children,
        );

  static const String name = 'OthersProfileRoute';

  static const _i21.PageInfo<OthersProfileRouteArgs> page =
      _i21.PageInfo<OthersProfileRouteArgs>(name);
}

class OthersProfileRouteArgs {
  const OthersProfileRouteArgs({
    this.key,
    required this.username,
    this.onDeleteFriendCallBack,
  });

  final _i22.Key? key;

  final String username;

  final dynamic onDeleteFriendCallBack;

  @override
  String toString() {
    return 'OthersProfileRouteArgs{key: $key, username: $username, onDeleteFriendCallBack: $onDeleteFriendCallBack}';
  }
}

/// generated route for
/// [_i18.RequestTagPage]
class RequestTagRoute extends _i21.PageRouteInfo<void> {
  const RequestTagRoute({List<_i21.PageRouteInfo>? children})
      : super(
          RequestTagRoute.name,
          initialChildren: children,
        );

  static const String name = 'RequestTagRoute';

  static const _i21.PageInfo<void> page = _i21.PageInfo<void>(name);
}

/// generated route for
/// [_i19.MultiplePhotosViewer]
class MultiplePhotosViewer
    extends _i21.PageRouteInfo<MultiplePhotosViewerArgs> {
  MultiplePhotosViewer({
    _i22.Key? key,
    required List<_i23.Uint8List> listOfPhotoBytes,
    required int initialIndex,
    required dynamic actionFunction,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          MultiplePhotosViewer.name,
          args: MultiplePhotosViewerArgs(
            key: key,
            listOfPhotoBytes: listOfPhotoBytes,
            initialIndex: initialIndex,
            actionFunction: actionFunction,
          ),
          initialChildren: children,
        );

  static const String name = 'MultiplePhotosViewer';

  static const _i21.PageInfo<MultiplePhotosViewerArgs> page =
      _i21.PageInfo<MultiplePhotosViewerArgs>(name);
}

class MultiplePhotosViewerArgs {
  const MultiplePhotosViewerArgs({
    this.key,
    required this.listOfPhotoBytes,
    required this.initialIndex,
    required this.actionFunction,
  });

  final _i22.Key? key;

  final List<_i23.Uint8List> listOfPhotoBytes;

  final int initialIndex;

  final dynamic actionFunction;

  @override
  String toString() {
    return 'MultiplePhotosViewerArgs{key: $key, listOfPhotoBytes: $listOfPhotoBytes, initialIndex: $initialIndex, actionFunction: $actionFunction}';
  }
}

/// generated route for
/// [_i20.SinglePhotoViewer]
class SinglePhotoViewer extends _i21.PageRouteInfo<SinglePhotoViewerArgs> {
  SinglePhotoViewer({
    _i22.Key? key,
    required _i23.Uint8List photoBytes,
    required List<_i22.Widget> actions,
    List<_i21.PageRouteInfo>? children,
  }) : super(
          SinglePhotoViewer.name,
          args: SinglePhotoViewerArgs(
            key: key,
            photoBytes: photoBytes,
            actions: actions,
          ),
          initialChildren: children,
        );

  static const String name = 'SinglePhotoViewer';

  static const _i21.PageInfo<SinglePhotoViewerArgs> page =
      _i21.PageInfo<SinglePhotoViewerArgs>(name);
}

class SinglePhotoViewerArgs {
  const SinglePhotoViewerArgs({
    this.key,
    required this.photoBytes,
    required this.actions,
  });

  final _i22.Key? key;

  final _i23.Uint8List photoBytes;

  final List<_i22.Widget> actions;

  @override
  String toString() {
    return 'SinglePhotoViewerArgs{key: $key, photoBytes: $photoBytes, actions: $actions}';
  }
}
