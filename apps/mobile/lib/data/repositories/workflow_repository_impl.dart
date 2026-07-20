import 'dart:async';
import 'package:mobile/data/datasources/workflow_socket_datasource.dart';
import 'package:mobile/domain/entities/workflow_status.dart';
import 'package:mobile/domain/repositories/workflow_repository.dart';

class WorkflowRepositoryImpl implements WorkflowRepository {
  final WorkflowSocketDataSource dataSource;

  WorkflowRepositoryImpl({required this.dataSource});

  @override
  Stream<WorkflowStatus> observeWorkflow() {
    return dataSource.statusStream.map((model) => model.toEntity());
  }

  @override
  Future<void> disconnect() async {
    dataSource.disconnect();
  }
}
