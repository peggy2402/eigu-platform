import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:mobile/core/auth/auth_provider.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/theme/theme_notifier.dart';
import 'package:mobile/presentation/pages/dashboard/dashboard_page.dart';
import 'package:mobile/core/ui/toast_service.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeNotifier()),
        ChangeNotifierProvider(create: (_) => AuthProvider()..init()),
      ],
      child: const EiguMobileApp(),
    ),
  );
}

class EiguMobileApp extends StatefulWidget {
  const EiguMobileApp({super.key});
  @override
  State<EiguMobileApp> createState() => _EiguMobileAppState();
}

class _EiguMobileAppState extends State<EiguMobileApp> {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  late StreamSubscription<List<ConnectivityResult>> _connectivitySubscription;
  bool _isOnline = true;
  bool _hasInitialized = false;

  @override
  void initState() {
    super.initState();
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      if (!_hasInitialized) { _hasInitialized = true; return; }
      bool isConnected = !results.contains(ConnectivityResult.none);
      if (isConnected && !_isOnline) {
        _isOnline = true;
        if (navigatorKey.currentContext != null) {
          ToastService.show('Đã kết nối lại', description: 'Hệ thống đã kết nối mạng thành công.', type: 'success');
        }
      } else if (!isConnected && _isOnline) {
        _isOnline = false;
        if (navigatorKey.currentContext != null) {
          ToastService.show('Mất kết nối', description: 'Hệ thống cần phải có mạng thì mới sử dụng được.', type: 'error');
        }
      }
    });
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = context.watch<ThemeNotifier>().mode;
    return MaterialApp(
      navigatorKey: navigatorKey,
      title: 'EIGU Platform',
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      themeMode: themeMode,
      builder: (context, child) {
        ToastService.init(context);
        return child!;
      },
      home: const AuthFlow(),
      debugShowCheckedModeBanner: false,
    );
  }
}
