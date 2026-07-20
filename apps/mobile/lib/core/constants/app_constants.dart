class AppConstants {
  static const String wsUrl = String.fromEnvironment('WS_URL', defaultValue: 'http://localhost:3001/workflow');
  static const String apiBaseUrl = String.fromEnvironment('API_URL', defaultValue: 'http://localhost:3001/api');
}
