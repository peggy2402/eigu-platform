import 'package:mobile/domain/entities/workflow_status.dart';
import 'package:mobile/domain/repositories/workflow_repository.dart';

class ObserveWorkflowUseCase {
  final WorkflowRepository repository;

  ObserveWorkflowUseCase({required this.repository});

  Stream<WorkflowStatus> call() => repository.observeWorkflow();
}
