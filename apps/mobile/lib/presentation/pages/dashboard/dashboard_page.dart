import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:mobile/core/auth/auth_provider.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/theme/theme_notifier.dart';
import 'package:mobile/data/datasources/workflow_socket_datasource.dart';
import 'package:mobile/data/repositories/workflow_repository_impl.dart';
import 'package:mobile/domain/usecases/observe_workflow_usecase.dart';
import 'package:mobile/presentation/bloc/workflow/workflow_bloc.dart';
import 'package:mobile/presentation/bloc/workflow/workflow_event.dart';
import 'package:mobile/presentation/bloc/workflow/workflow_state.dart';
import 'package:mobile/presentation/pages/auth/login_page.dart';
import 'package:mobile/presentation/pages/settings/settings_page.dart';
import 'package:mobile/presentation/pages/settings/guide_page.dart';

class AuthFlow extends StatelessWidget {
  const AuthFlow({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (auth.loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (!auth.isLoggedIn) {
      return const LoginPage();
    }
    return const DashboardPage();
  }
}

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final dataSource = WorkflowSocketDataSource();
    final repository = WorkflowRepositoryImpl(dataSource: dataSource);
    final useCase = ObserveWorkflowUseCase(repository: repository);

    return BlocProvider(
      create: (_) {
        dataSource.connect();
        final bloc = WorkflowBloc(observeWorkflowUseCase: useCase);
        bloc.add(WorkflowObserve());
        return bloc;
      },
      child: _DashboardView(dataSource: dataSource),
    );
  }
}

class _DashboardView extends StatelessWidget {
  final WorkflowSocketDataSource dataSource;

  const _DashboardView({required this.dataSource});

  void _showSearchDialog(BuildContext context) {
    final tools = [
      'Hồ sơ', 'Tự động cắt', 'Tạo video AI', 'Tìm ngách hot',
      'Tạo workflow', 'Ghi thao tác',
      'Tài khoản', 'Tiếp thị liên kết', 'Đội nhóm', 'Tiện ích',
      'Hướng dẫn', 'Cài đặt',
    ];
    showDialog(
      context: context,
      builder: (ctx) {
        final ctrl = TextEditingController();
        return StatefulBuilder(builder: (ctx, setDlgState) {
          final query = ctrl.text.trim().toLowerCase();
          final filtered = query.isEmpty
              ? tools
              : tools.where((t) => t.toLowerCase().contains(query)).toList();
          return AlertDialog(
            backgroundColor: Theme.of(context).cardColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            contentPadding: const EdgeInsets.all(0),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                  child: TextField(
                    controller: ctrl,
                    autofocus: true,
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm tính năng...',
                      hintStyle: const TextStyle(color: AppTheme.textSecondary),
                      border: InputBorder.none,
                    ),
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16),
                    onChanged: (_) => setDlgState(() {}),
                  ),
                ),
                const Divider(height: 1, color: Color(0xFF2A2D3A)),
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 280),
                  child: ListView(
                    shrinkWrap: true,
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    children: filtered.map((tool) => ListTile(
                      dense: true,
                      title: Text(tool, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14)),
                      onTap: () {
                        Navigator.of(ctx).pop();
                        _navigateToTool(context, tool);
                      },
                    )).toList(),
                  ),
                ),
              ],
            ),
          );
        });
      },
    );
  }

  void _navigateToTool(BuildContext context, String tool) {
    if (tool == 'Cài đặt') {
      final notifier = context.read<ThemeNotifier>();
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => SettingsPage(
            currentMode: notifier.mode,
            onThemeChanged: (mode) => notifier.setTheme(mode),
          ),
        ),
      );
    } else if (tool == 'Hướng dẫn') {
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => const GuidePage()));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppTheme.textPrimary : AppTheme.lightTextPrimary;

    return Scaffold(
      appBar: AppBar(
        title: const Text('EIGU Live Telemetry'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            tooltip: 'Tìm kiếm (Ctrl+K)',
            onPressed: () => _showSearchDialog(context),
          ),
          BlocBuilder<WorkflowBloc, WorkflowState>(
            builder: (context, state) {
              return Icon(
                state.isConnected ? Icons.cloud_done : Icons.cloud_off,
                color: state.isConnected ? Colors.greenAccent : Colors.redAccent,
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            tooltip: 'Thông báo',
            onPressed: () {},
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.account_circle),
            tooltip: 'Tài khoản',
            onSelected: (value) {
              if (value == 'profile') {
                // To be implemented: Navigate to Profile page
              } else if (value == 'settings') {
                final notifier = context.read<ThemeNotifier>();
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => SettingsPage(
                      currentMode: notifier.mode,
                      onThemeChanged: (mode) => notifier.setTheme(mode),
                    ),
                  ),
                );
              } else if (value == 'logout') {
                context.read<AuthProvider>().logout();
              }
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(
                value: 'profile',
                child: ListTile(
                  leading: Icon(Icons.person, size: 20),
                  title: Text('Hồ sơ'),
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                ),
              ),
              const PopupMenuItem<String>(
                value: 'settings',
                child: ListTile(
                  leading: Icon(Icons.settings, size: 20),
                  title: Text('Cài đặt'),
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'logout',
                child: ListTile(
                  leading: Icon(Icons.logout, size: 20, color: Colors.red),
                  title: Text('Đăng xuất', style: TextStyle(color: Colors.red)),
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                ),
              ),
            ],
          ),
        ],
      ),
      drawer: Drawer(
        child: Container(
          color: Theme.of(context).scaffoldBackgroundColor,
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              DrawerHeader(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppTheme.accent, Color(0xFFA78BFA)]),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    const CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.white24,
                      child: Icon(Icons.person, color: Colors.white, size: 28),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Xin chào, ${auth.displayName}',
                      style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      auth.user?['email'] as String? ?? '',
                      style: const TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),
              // Drawer Header

              ExpansionTile(
                leading: const Icon(Icons.build, color: AppTheme.textSecondary),
                title: Text('Công cụ', style: TextStyle(color: textColor)),
                iconColor: AppTheme.textSecondary,
                collapsedIconColor: AppTheme.textSecondary,
                children: [
                  ListTile(title: const Text('  Tự động cắt', style: TextStyle(color: AppTheme.textSecondary, fontSize: 14)), onTap: () => Navigator.of(context).pop()),
                  ListTile(title: const Text('  Tạo video AI', style: TextStyle(color: AppTheme.textSecondary, fontSize: 14)), onTap: () => Navigator.of(context).pop()),
                  ListTile(title: const Text('  Tìm ngách hot', style: TextStyle(color: AppTheme.textSecondary, fontSize: 14)), onTap: () => Navigator.of(context).pop()),
                ],
              ),
              ExpansionTile(
                leading: const Icon(Icons.autorenew, color: AppTheme.textSecondary),
                title: Text('Tự động hóa', style: TextStyle(color: textColor)),
                iconColor: AppTheme.textSecondary,
                collapsedIconColor: AppTheme.textSecondary,
                children: [
                  ListTile(title: const Text('  Tạo workflow', style: TextStyle(color: AppTheme.textSecondary, fontSize: 14)), onTap: () => Navigator.of(context).pop()),
                  ListTile(title: const Text('  Ghi thao tác', style: TextStyle(color: AppTheme.textSecondary, fontSize: 14)), onTap: () => Navigator.of(context).pop()),
                ],
              ),
              ListTile(
                leading: const Icon(Icons.people, color: AppTheme.textSecondary),
                title: Text('Tài khoản', style: TextStyle(color: textColor)),
                onTap: () => Navigator.of(context).pop(),
              ),
              ListTile(
                leading: const Icon(Icons.link, color: AppTheme.textSecondary),
                title: Text('Tiếp thị liên kết', style: TextStyle(color: textColor)),
                onTap: () => Navigator.of(context).pop(),
              ),
              ListTile(
                leading: const Icon(Icons.group, color: AppTheme.textSecondary),
                title: Text('Đội nhóm', style: TextStyle(color: textColor)),
                onTap: () => Navigator.of(context).pop(),
              ),
              ListTile(
                leading: const Icon(Icons.grid_view, color: AppTheme.textSecondary),
                title: Text('Tiện ích', style: TextStyle(color: textColor)),
                onTap: () => Navigator.of(context).pop(),
              ),
              ListTile(
                leading: const Icon(Icons.menu_book, color: AppTheme.textSecondary),
                title: Text('Hướng dẫn sử dụng', style: TextStyle(color: textColor)),
                onTap: () {
                  Navigator.of(context).pop();
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const GuidePage()));
                },
              ),
              // End of Drawer List

            ],
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: BlocBuilder<WorkflowBloc, WorkflowState>(
          builder: (context, state) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'WORKFLOW STATUS',
                  style: TextStyle(
                    color: AppTheme.accent,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  state.status,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 20,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 32),
                Container(
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: state.progress,
                      backgroundColor: Colors.transparent,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.success),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '${(state.progress * 100).toInt()}% Completed',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.bgCard,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.info_outline, color: Colors.blueAccent),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Ứng dụng đang theo dõi luồng xử lý FFmpeg và Anti-detect Browser trên Mac của bạn.',
                          style: TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
