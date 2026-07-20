import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/domain/usecases/observe_workflow_usecase.dart';
import 'package:mobile/presentation/bloc/workflow/workflow_event.dart';
import 'package:mobile/presentation/bloc/workflow/workflow_state.dart';

class WorkflowBloc extends Bloc<WorkflowEvent, WorkflowState> {
  final ObserveWorkflowUseCase observeWorkflowUseCase;
  StreamSubscription? _subscription;

  WorkflowBloc({required this.observeWorkflowUseCase})
      : super(const WorkflowState()) {
    on<WorkflowObserve>(_onObserve);
    on<WorkflowUpdated>(_onUpdated);
    on<WorkflowDisconnected>(_onDisconnected);
  }

  void _onObserve(WorkflowObserve event, Emitter<WorkflowState> emit) {
    _subscription = observeWorkflowUseCase().listen(
      (workflowStatus) {
        add(WorkflowUpdated(
          status: workflowStatus.message ?? workflowStatus.status,
          progress: workflowStatus.progress / 100.0,
          message: workflowStatus.message,
        ));
      },
      onError: (_) => add(WorkflowDisconnected()),
    );
  }

  void _onUpdated(WorkflowUpdated event, Emitter<WorkflowState> emit) {
    emit(state.copyWith(
      isConnected: true,
      status: event.status,
      progress: event.progress,
    ));
  }

  void _onDisconnected(WorkflowDisconnected event, Emitter<WorkflowState> emit) {
    emit(state.copyWith(isConnected: false));
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
