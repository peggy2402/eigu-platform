import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/presentation/pages/settings/guide_page.dart';

class SettingsPage extends StatefulWidget {
  final ThemeMode currentMode;
  final ValueChanged<ThemeMode> onThemeChanged;

  const SettingsPage({
    super.key,
    required this.currentMode,
    required this.onThemeChanged,
  });

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  late ThemeMode _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.currentMode;
  }

  @override
  void didUpdateWidget(SettingsPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.currentMode != oldWidget.currentMode) {
      _selected = widget.currentMode;
    }
  }

  void _setTheme(ThemeMode mode) {
    setState(() => _selected = mode);
    widget.onThemeChanged(mode);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppTheme.textPrimary : AppTheme.lightTextPrimary;
    final mutedColor = isDark ? AppTheme.textSecondary : AppTheme.lightTextSecondary;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cài đặt'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _sectionHeader('Giao diện', textColor),
          const SizedBox(height: 12),
          Row(
            children: [
              _themeButton(ThemeMode.light, Icons.light_mode, 'Sáng'),
              const SizedBox(width: 8),
              _themeButton(ThemeMode.dark, Icons.dark_mode, 'Tối'),
              const SizedBox(width: 8),
              _themeButton(ThemeMode.system, Icons.settings_brightness, 'Hệ thống'),
            ],
          ),
          const SizedBox(height: 32),
          _sectionHeader('Cache & Dữ liệu', textColor),
          const SizedBox(height: 8),
          _hint('Quản lý bộ nhớ đệm, xoá dữ liệu workflow, cấu hình đầu ra mặc định.', mutedColor),
          const SizedBox(height: 24),
          _sectionHeader('Workflow Mặc định', textColor),
          const SizedBox(height: 8),
          _hint('Cài đặt mặc định cho cắt ghép, tỉ lệ khung hình, xử lý Anti-Detect, metadata.', mutedColor),
          const SizedBox(height: 24),
          _sectionHeader('Proxy & Mạng', textColor),
          const SizedBox(height: 8),
          _hint('Cấu hình SOCKS5 / Residential proxy cho Anti-Detect Browser, chặn rò rỉ WebRTC.', mutedColor),
          const SizedBox(height: 24),
          _sectionHeader('Trình duyệt & Hồ sơ', textColor),
          const SizedBox(height: 8),
          _hint('Quản lý Chrome Profile isolation, Chromium data-dir, tự động nạp extensions.', mutedColor),
          const SizedBox(height: 24),
          _sectionHeader('Thông báo', textColor),
          const SizedBox(height: 8),
          _hint('Cấu hình push notification khi workflow hoàn tất hoặc lỗi.', mutedColor),
          const SizedBox(height: 24),
          const Divider(),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.menu_book),
            title: const Text('Hướng dẫn sử dụng', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const GuidePage()),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title, Color color) {
    return Text(
      title.toUpperCase(),
      style: TextStyle(
        color: AppTheme.accent,
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 2,
      ),
    );
  }

  Widget _hint(String text, Color color) {
    return Text(text, style: TextStyle(color: color, fontSize: 13, height: 1.5));
  }

  Widget _themeButton(ThemeMode mode, IconData icon, String label) {
    final selected = _selected == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () => _setTheme(mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            color: selected ? AppTheme.accent.withOpacity(0.12) : null,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: selected ? AppTheme.accent : Colors.white.withOpacity(0.15),
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: selected ? AppTheme.accent : null,
              ),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: selected ? AppTheme.accent : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
