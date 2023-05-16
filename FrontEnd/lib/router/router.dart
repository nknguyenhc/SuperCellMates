import 'package:auto_route/auto_route.dart';

import 'router.gr.dart';

// "flutter packages pub run build_runner watch"

@AutoRouterConfig(replaceInRouteName: 'Page,Route')
class AppRouter extends $AppRouter {
  @override
  List<AutoRoute> get routes => [
        AutoRoute(page: LoginRoute.page, initial: true),
        AutoRoute(page: MainScaffold.page),
        AutoRoute(page: FriendRequestRoute.page),
        AutoRoute(page: PrivacyAgreementRoute.page),

      ];
}
