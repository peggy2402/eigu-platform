import 'package:equatable/equatable.dart';

class WorkflowState extends Equatable {
  final bool isConnected;
  final String status;
  final double progress;

  const WorkflowState({
    this.isConnected = false,
    this.status = 'System Idle',
    this.progress = 0.0,
  });

  WorkflowState copyWith({
    bool? isConnected,
    String? status,
    double? progress,
  }) {
    return WorkflowState(
      isConnected: isConnected ?? this.isConnected,
      status: status ?? this.status,
      progress: progress ?? this.progress,
    );
  }

  @override
  List<Object?> get props => [isConnected, status, progress];
}
