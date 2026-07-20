import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('App should render dashboard page', (WidgetTester tester) async {
    await tester.pumpWidget(const EiguMobileApp());
    expect(find.text('EIGU Live Telemetry'), findsOneWidget);
    expect(find.text('WORKFLOW STATUS'), findsOneWidget);
  });
}
