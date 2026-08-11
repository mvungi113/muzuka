import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:muzuka/main.dart';

void main() {
  testWidgets('App should render', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MuzukaApp(),
      ),
    );

    expect(find.text('Muzuka'), findsOneWidget);
  });
}
