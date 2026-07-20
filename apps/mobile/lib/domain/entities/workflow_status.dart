import 'package:equatable/equatable.dart';

class WorkflowStatus extends Equatable {
  final String status;
  final double progress;
  final String? message;

  const WorkflowStatus({
    required this.status,
    required this.progress,
    this.message,
  });

  @override
  List<Object?> get props => [status, progress, message];
}
