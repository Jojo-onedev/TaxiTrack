import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/service_locator.dart';
import 'package:taxi_track/features/auth/auth_bloc.dart';
import 'package:taxi_track/features/auth/auth_bloc_impl.dart';
import 'package:taxi_track/features/client/client_home_screen.dart';
import 'package:taxi_track/shared/widgets/app_button.dart';
import 'package:taxi_track/shared/widgets/app_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _residenceController = TextEditingController();
  final _passwordController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _residenceController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => AuthBloc(sl()),
      child: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is Authenticated) {
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(builder: (_) => const ClientHomeScreen()),
              (route) => false,
            );
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
              appBar: AppBar(
                title: const Text('Inscription Client'),
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
              body: SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24.0,
                    vertical: 20,
                  ),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Créer un compte',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppColors.black,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Veuillez remplir les informations ci-dessous pour rejoindre TaxiTrack.',
                          style: TextStyle(fontSize: 14, color: AppColors.grey),
                        ),
                        const SizedBox(height: 32),
                        AppTextField(
                          controller: _firstNameController,
                          labelText: 'Prénom',
                          hintText: 'Ex: Thomas',
                          prefixIcon: Icons.person_outline,
                          validator: (v) => v!.isEmpty ? 'Champ requis' : null,
                        ),
                        const SizedBox(height: 20),
                        AppTextField(
                          controller: _lastNameController,
                          labelText: 'Nom',
                          hintText: 'Ex: Durant',
                          prefixIcon: Icons.person_outline,
                          validator: (v) => v!.isEmpty ? 'Champ requis' : null,
                        ),
                        const SizedBox(height: 20),
                        AppTextField(
                          controller: _phoneController,
                          labelText: 'Numéro de téléphone',
                          hintText: '06 00 00 00 00',
                          keyboardType: TextInputType.phone,
                          prefixIcon: Icons.phone_android,
                          validator: (v) => v!.isEmpty ? 'Champ requis' : null,
                        ),
                        const SizedBox(height: 20),
                        AppTextField(
                          controller: _residenceController,
                          labelText: 'Lieu de résidence',
                          hintText: 'Ex: Paris, France',
                          prefixIcon: Icons.home_outlined,
                          validator: (v) => v!.isEmpty ? 'Champ requis' : null,
                        ),
                        const SizedBox(height: 20),
                        AppTextField(
                          controller: _passwordController,
                          labelText: 'Mot de passe',
                          hintText: '********',
                          isPassword: true,
                          prefixIcon: Icons.lock_outline,
                          validator: (v) =>
                              v!.length < 6 ? 'Minimum 6 caractères' : null,
                        ),
                        const SizedBox(height: 40),
                        AppButton(
                          text: 'S\'inscrire',
                          isLoading: state is AuthLoading,
                          onPressed: () {
                            if (_formKey.currentState!.validate()) {
                              context.read<AuthBloc>().add(
                                SignUpRequested(
                                  firstName: _firstNameController.text,
                                  lastName: _lastNameController.text,
                                  phoneNumber: _phoneController.text,
                                  password: _passwordController.text,
                                  residence: _residenceController.text,
                                ),
                              );
                            }
                          },
                        ),
                        const SizedBox(height: 24),
                      ],
                    ),
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
