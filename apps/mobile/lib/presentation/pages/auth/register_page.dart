import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/auth/auth_provider.dart';
import 'package:mobile/core/theme/app_theme.dart';

final _emailRE = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

class PasswordStrength {
  final int level;
  final String label;
  final double pct;
  final Color color;

  PasswordStrength._({required this.level, required this.label, required this.pct, required this.color});

  static PasswordStrength compute(String pw) {
    if (pw.isEmpty) return PasswordStrength._(level: 0, label: '', pct: 0, color: Colors.transparent);
    int score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.contains(RegExp(r'[a-z]')) && pw.contains(RegExp(r'[A-Z]'))) score++;
    if (pw.contains(RegExp(r'\d'))) score++;
    if (pw.contains(RegExp(r'[^a-zA-Z0-9]'))) score++;
    if (score <= 1) return PasswordStrength._(level: 1, label: 'Yếu', pct: 0.25, color: const Color(0xFFEF4444));
    if (score <= 2) return PasswordStrength._(level: 2, label: 'Trung bình', pct: 0.50, color: const Color(0xFFF59E0B));
    if (score <= 3) return PasswordStrength._(level: 3, label: 'Khá', pct: 0.75, color: const Color(0xFF10B981));
    return PasswordStrength._(level: 4, label: 'Mạnh', pct: 1.0, color: const Color(0xFF6366F1));
  }
}

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _usernameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _showPw = false;
  String? _error;
  bool _loading = false;

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    final username = _usernameCtrl.text.trim();
    final email = _emailCtrl.text.trim();
    final password = _passCtrl.text;
    final confirm = _confirmCtrl.text;
    if (username.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (username.length < 3) { setState(() => _error = 'Tên đăng nhập ít nhất 3 ký tự'); return; }
    if (!_emailRE.hasMatch(email)) { setState(() => _error = 'Email không hợp lệ'); return; }
    if (password.length < 6) { setState(() => _error = 'Mật khẩu ít nhất 6 ký tự'); return; }
    if (password != confirm) { setState(() => _error = 'Mật khẩu xác nhận không khớp'); return; }
    setState(() { _error = null; _loading = true; });
    try {
      await context.read<AuthProvider>().register(username, email, password);
      if (mounted) {
        Navigator.of(context).pushReplacement(MaterialPageRoute(
          builder: (_) => _VerifyPage(email: email),
        ));
      }
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
    final strength = PasswordStrength.compute(_passCtrl.text);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Đăng ký'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.of(context).pop()),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
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
              controller: _usernameCtrl,
              decoration: InputDecoration(
                labelText: 'Tên đăng nhập',
                labelStyle: TextStyle(color: mutedColor, fontSize: 13),
                filled: true, fillColor: Theme.of(context).cardColor,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
              style: TextStyle(color: textColor),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _emailCtrl,
              decoration: InputDecoration(
                labelText: 'Email',
                labelStyle: TextStyle(color: mutedColor, fontSize: 13),
                filled: true, fillColor: Theme.of(context).cardColor,
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
                filled: true, fillColor: Theme.of(context).cardColor,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                suffixIcon: IconButton(
                  icon: Icon(_showPw ? Icons.visibility_off : Icons.visibility, size: 20),
                  onPressed: () => setState(() => _showPw = !_showPw),
                ),
              ),
              style: TextStyle(color: textColor),
              onChanged: (_) => setState(() {}),
            ),
            if (_passCtrl.text.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(
                        value: strength.pct,
                        backgroundColor: Colors.white.withOpacity(0.1),
                        valueColor: AlwaysStoppedAnimation<Color>(strength.color),
                        minHeight: 4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(strength.label, style: TextStyle(fontSize: 11, color: mutedColor)),
                  ],
                ),
              ),
            const SizedBox(height: 16),
            TextField(
              controller: _confirmCtrl,
              obscureText: !_showPw,
              decoration: InputDecoration(
                labelText: 'Nhập lại mật khẩu',
                labelStyle: TextStyle(color: mutedColor, fontSize: 13),
                filled: true, fillColor: Theme.of(context).cardColor,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
              ),
              style: TextStyle(color: textColor),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity, height: 48,
              child: ElevatedButton(
                onPressed: _loading ? null : _handleRegister,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accent, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Đăng ký', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VerifyPage extends StatefulWidget {
  final String email;
  const _VerifyPage({required this.email});

  @override
  State<_VerifyPage> createState() => _VerifyPageState();
}

class _VerifyPageState extends State<_VerifyPage> {
  final _otpCtrls = List.generate(6, (_) => TextEditingController());
  final _otpFocus = List.generate(6, (_) => FocusNode());
  String? _error;
  bool _loading = false;

  @override
  void dispose() {
    for (final c in _otpCtrls) c.dispose();
    for (final f in _otpFocus) f.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    final otp = _otpCtrls.map((c) => c.text).join();
    if (otp.length != 6) { setState(() => _error = 'Nhập đủ 6 số OTP'); return; }
    setState(() { _error = null; _loading = true; });
    try {
      await context.read<AuthProvider>().verifyEmail(widget.email, otp);
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

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Xác thực email'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.of(context).pop()),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Text('Nhập mã OTP gửi đến', style: TextStyle(color: textColor, fontSize: 14)),
            const SizedBox(height: 4),
            Text(widget.email, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
            const SizedBox(height: 24),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(6, (i) => Container(
                width: 48, height: 56,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                child: TextField(
                  controller: _otpCtrls[i],
                  focusNode: _otpFocus[i],
                  textAlign: TextAlign.center,
                  maxLength: 1,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
                  decoration: InputDecoration(
                    counterText: '',
                    filled: true, fillColor: Theme.of(context).cardColor,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onChanged: (v) {
                    if (v.isNotEmpty && i < 5) _otpFocus[i + 1].requestFocus();
                  },
                ),
              )),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity, height: 48,
              child: ElevatedButton(
                onPressed: _loading ? null : _handleVerify,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accent, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Xác thực', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
