import 'package:mobile/domain/entities/workflow_status.dart';

class WorkflowStatusModel {
  final String status;
  final double progress;
  final String? message;

  const WorkflowStatusModel({
    required this.status,
    required this.progress,
    this.message,
  });

  factory WorkflowStatusModel.fromJson(Map<String, dynamic> json) {
    return WorkflowStatusModel(
      status: json['status'] as String? ?? '',
      progress: (json['progress'] as num?)?.toDouble() ?? 0,
      message: json['message'] as String?,
    );
  }

  WorkflowStatus toEntity() {
    return WorkflowStatus(
      status: status,
      progress: progress,
      message: message,
    );
  }
}
