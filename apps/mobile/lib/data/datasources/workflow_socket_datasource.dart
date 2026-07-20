import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/data/models/workflow_status_model.dart';

class WorkflowSocketDataSource {
  late IO.Socket _socket;
  final StreamController<WorkflowStatusModel> _controller =
      StreamController<WorkflowStatusModel>.broadcast();

  Stream<WorkflowStatusModel> get statusStream => _controller.stream;
  IO.Socket get socket => _socket;

  void connect() {
    _socket = IO.io(AppConstants.wsUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
    });

    _socket.onConnect((_) {
      debugPrint('Mobile WebSocket connected');
    });

    _socket.onDisconnect((_) {
      debugPrint('Mobile WebSocket disconnected');
    });

    _socket.on('workflowUpdated', (data) {
      if (data is Map<String, dynamic>) {
        _controller.add(WorkflowStatusModel.fromJson(data));
      }
    });
  }

  void disconnect() {
    _socket.dispose();
    _controller.close();
  }
}
