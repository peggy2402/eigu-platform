import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/auth/auth_provider.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/presentation/pages/auth/register_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _identifierCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _showPw = false;
  String? _error;
  bool _loading = false;

  @override
  void dispose() {
    _identifierCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final identifier = _identifierCtrl.text.trim();
    final password = _passCtrl.text;
    if (identifier.isEmpty || password.isEmpty) {
      setState(() => _error = 'Vui lòng nhập email hoặc tên đăng nhập và mật khẩu');
      return;
    }
    setState(() { _error = null; _loading = true; });
    try {
      await context.read<AuthProvider>().login(identifier, password);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppTheme.textPrimary : AppTheme.lightTextPrimary;
    final mutedColor = isDark ? AppTheme.textSecondary : AppTheme.lightTextSecondary;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [AppTheme.accent, Color(0xFFA78BFA)]),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Center(child: Text('E', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white))),
                ),
                const SizedBox(height: 16),
                Text('EIGU Platform', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: textColor)),
                const SizedBox(height: 4),
                Text('Anti-Detect Automation Engine', style: TextStyle(fontSize: 13, color: mutedColor)),
                const SizedBox(height: 40),
                if (_error != null)
                  Container(
                    width: double.infinity, padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: AppTheme.danger.withOpacity(0.12),
                      border: Border.all(color: AppTheme.danger.withOpacity(0.3)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_error!, style: const TextStyle(color: AppTheme.danger, fontSize: 13)),
                  ),
                TextField(
                  controller: _identifierCtrl,
                  decoration: InputDecoration(
                    labelText: 'Email hoặc tên đăng nhập',
                    labelStyle: TextStyle(color: mutedColor, fontSize: 13),
                    filled: true,
                    fillColor: Theme.of(context).cardColor,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  style: TextStyle(color: textColor),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passCtrl,
                  obscureText: !_showPw,
                  decoration: InputDecoration(
                    labelText: 'Mật khẩu',
                    labelStyle: TextStyle(color: mutedColor, fontSize: 13),
                    filled: true,
                    fillColor: Theme.of(context).cardColor,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    suffixIcon: IconButton(
                      icon: Icon(_showPw ? Icons.visibility_off : Icons.visibility, size: 20),
                      onPressed: () => setState(() => _showPw = !_showPw),
                    ),
                  ),
                  style: TextStyle(color: textColor),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity, height: 48,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accent,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Đăng nhập', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Chưa có tài khoản? ', style: TextStyle(fontSize: 13, color: mutedColor)),
                    GestureDetector(
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterPage())),
                      child: const Text('Đăng ký', style: TextStyle(fontSize: 13, color: AppTheme.accent)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
