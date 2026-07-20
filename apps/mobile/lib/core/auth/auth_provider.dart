import 'package:flutter/foundation.dart';
import 'package:mobile/core/api/api_client.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  String? _token;
  bool _loading = true;

  Map<String, dynamic>? get user => _user;
  String? get token => _token;
  bool get loading => _loading;
  bool get isLoggedIn => _token != null;

  String get displayName {
    final u = _user;
    if (u == null) return 'User';
    return (u['username'] as String?) ?? (u['email'] as String).split('@').first;
  }

  Future<void> init() async {
    // No persistent storage; if token needed between restarts, add shared_preferences later
    _loading = false;
    notifyListeners();
  }

  Future<void> login(String identifier, String password) async {
    final data = await apiClient.post('/auth/login', {
      'identifier': identifier,
      'password': password,
    });
    _token = data['accessToken'] as String;
    _user = data['user'] as Map<String, dynamic>;
    apiClient.setToken(_token);
    notifyListeners();
  }

  Future<void> register(String username, String email, String password) async {
    await apiClient.post('/auth/register', {
      'username': username,
      'email': email,
      'password': password,
    });
  }

  Future<void> verifyEmail(String email, String otp) async {
    final data = await apiClient.post('/auth/verify-email', {
      'email': email,
      'otp': otp,
    });
    _token = data['accessToken'] as String;
    _user = data['user'] as Map<String, dynamic>;
    apiClient.setToken(_token);
    notifyListeners();
  }

  Future<void> logout() async {
    try { await apiClient.post('/auth/logout', {}); } catch (_) {}
    _token = null;
    _user = null;
    apiClient.setToken(null);
    notifyListeners();
  }

  Future<bool> tryRestore() async {
    if (_token == null) return false;
    try {
      _user = await apiClient.get('/auth/me');
      notifyListeners();
      return true;
    } catch (_) {
      _token = null;
      _user = null;
      apiClient.setToken(null);
      notifyListeners();
      return false;
    }
  }
}
