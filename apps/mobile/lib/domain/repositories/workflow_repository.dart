import 'package:mobile/domain/entities/workflow_status.dart';

abstract class WorkflowRepository {
  Stream<WorkflowStatus> observeWorkflow();
  Future<void> disconnect();
}
