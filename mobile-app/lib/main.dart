import 'package:flutter/material.dart';
import 'core/app_theme.dart';
import 'core/service_locator.dart';
import 'features/auth/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initServiceLocator();
  runApp(const TaxiTrackApp());
}

class TaxiTrackApp extends StatelessWidget {
  const TaxiTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TaxiTrack',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const SplashScreen(),
    );
  }
}
