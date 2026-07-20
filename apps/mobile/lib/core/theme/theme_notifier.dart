import 'package:flutter/material.dart';

class ThemeNotifier extends ChangeNotifier {
  ThemeMode _mode = ThemeMode.dark;

  ThemeMode get mode => _mode;

  void setTheme(ThemeMode mode) {
    _mode = mode;
    notifyListeners();
  }
}
