import 'package:equatable/equatable.dart';

abstract class WorkflowEvent extends Equatable {
  const WorkflowEvent();

  @override
  List<Object?> get props => [];
}

class WorkflowObserve extends WorkflowEvent {}

class WorkflowUpdated extends WorkflowEvent {
  final String status;
  final double progress;
  final String? message;

  const WorkflowUpdated({
    required this.status,
    required this.progress,
    this.message,
  });

  @override
  List<Object?> get props => [status, progress, message];
}

class WorkflowDisconnected extends WorkflowEvent {}
