import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/app_theme.dart';
import 'core/service_locator.dart';
import 'features/auth/auth_bloc.dart';
import 'features/auth/auth_bloc_impl.dart';
import 'features/auth/splash_screen.dart';
import 'features/driver/driver_bloc_impl.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initServiceLocator();
  runApp(const TaxiTrackApp());
}

class TaxiTrackApp extends StatelessWidget {
  const TaxiTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (context) => sl<AuthBloc>()..add(AuthCheckRequested()),
        ),
        BlocProvider<DriverBlocImpl>(create: (context) => sl<DriverBlocImpl>()),
      ],
      child: MaterialApp(
        title: 'TaxiTrack',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
