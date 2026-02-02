import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/service_locator.dart';
import 'package:taxi_track/core/auth_repository.dart';
import 'package:taxi_track/features/auth/auth_bloc.dart';
import 'package:taxi_track/features/auth/auth_bloc_impl.dart';
import 'package:taxi_track/features/auth/register_screen.dart';
import 'package:taxi_track/features/client/client_home_screen.dart';
import 'package:taxi_track/features/driver/driver_home_screen.dart';
import 'package:taxi_track/shared/widgets/app_button.dart';
import 'package:taxi_track/shared/widgets/app_text_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AuthBloc(sl<AuthRepository>()),
      child: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is Authenticated) {
            final nextScreen = state.user.role == UserRole.client
                ? const ClientHomeScreen()
                : const DriverHomeScreen();

            Navigator.of(
              context,
            ).pushReplacement(MaterialPageRoute(builder: (_) => nextScreen));
          } else if (state is AuthFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        child: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            return Scaffold(
              backgroundColor: AppColors.white,
              body: SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 60),
                      Center(
                        child: Image.asset(
                          'assets/images/logo.png',
                          height: 100,
                        ),
                      ),
                      const SizedBox(height: 48),
                      const Text(
                        'Bienvenue',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: AppColors.black,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Connectez-vous pour continuer',
                        style: TextStyle(fontSize: 16, color: AppColors.grey),
                      ),
                      const SizedBox(height: 40),
                      AppTextField(
                        controller: _phoneController,
                        labelText: 'Numéro de téléphone',
                        hintText: '06 00 00 00 00',
                        keyboardType: TextInputType.phone,
                        prefixIcon: Icons.phone_android,
                      ),
                      const SizedBox(height: 24),
                      AppTextField(
                        controller: _passwordController,
                        labelText: 'Mot de passe',
                        hintText: '********',
                        isPassword: true,
                        prefixIcon: Icons.lock_outline,
                      ),
                      const SizedBox(height: 16),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {},
                          child: const Text('Mot de passe oublié ?'),
                        ),
                      ),
                      const SizedBox(height: 32),
                      AppButton(
                        text: 'Se connecter',
                        isLoading: state is AuthLoading,
                        onPressed: () {
                          context.read<AuthBloc>().add(
                            LoginRequested(
                              _phoneController.text,
                              _passwordController.text,
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text("Vous n'avez pas de compte ?"),
                          TextButton(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const RegisterScreen(),
                                ),
                              );
                            },
                            child: const Text(
                              'S\'inscrire',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
