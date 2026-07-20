import 'package:flutter/material.dart';

class AppTheme {
  static const Color bgPrimary = Color(0xFF0D0F14);
  static const Color bgCard = Color(0xFF161821);
  static const Color accent = Color(0xFF6366F1);
  static const Color success = Color(0xFF10B981);
  static const Color danger = Color(0xFFEF4444);
  static const Color textPrimary = Color(0xFFE8EAF0);
  static const Color textSecondary = Color(0xFF8B90A0);

  static const Color lightBgPrimary = Color(0xFFF5F6FA);
  static const Color lightBgCard = Color(0xFFFFFFFF);
  static const Color lightTextPrimary = Color(0xFF1A1B23);
  static const Color lightTextSecondary = Color(0xFF6B6F80);

  static ThemeData darkTheme() {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: bgPrimary,
      primaryColor: accent,
      cardColor: bgCard,
      appBarTheme: const AppBarTheme(
        backgroundColor: bgCard,
        elevation: 0,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
      ),
      iconTheme: const IconThemeData(color: textSecondary),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: textPrimary),
        bodyMedium: TextStyle(color: textSecondary),
      ),
      dividerColor: const Color(0xFF2A2D3A),
    );
  }

  static ThemeData lightTheme() {
    return ThemeData.light().copyWith(
      scaffoldBackgroundColor: lightBgPrimary,
      primaryColor: accent,
      cardColor: lightBgCard,
      appBarTheme: const AppBarTheme(
        backgroundColor: lightBgCard,
        elevation: 0,
        iconTheme: IconThemeData(color: lightTextPrimary),
        titleTextStyle: TextStyle(
          color: lightTextPrimary,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 1,
        ),
      ),
      iconTheme: const IconThemeData(color: lightTextSecondary),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: lightTextPrimary),
        bodyMedium: TextStyle(color: lightTextSecondary),
      ),
      dividerColor: const Color(0xFFE2E4EA),
    );
  }
}
