import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}

class ApiClient {
  String? _token;

  void setToken(String? t) => _token = t;

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final uri = Uri.parse('${AppConstants.apiBaseUrl}$path');
    final res = await http.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      },
      body: jsonEncode(body),
    );
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) throw ApiException(data['message'] as String? ?? 'Request failed');
    return data;
  }

  Future<Map<String, dynamic>> get(String path) async {
    final uri = Uri.parse('${AppConstants.apiBaseUrl}$path');
    final res = await http.get(
      uri,
      headers: {
        if (_token != null) 'Authorization': 'Bearer $_token',
      },
    );
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400) throw ApiException(data['message'] as String? ?? 'Request failed');
    return data;
  }
}

final apiClient = ApiClient();
