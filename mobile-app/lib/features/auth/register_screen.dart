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
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _residenceController = TextEditingController();
  final _passwordController = TextEditingController();

  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
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
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
          }
        },
        child: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            return Scaffold(
              backgroundColor: AppColors.white,
              appBar: AppBar(
                backgroundColor: Colors.transparent,
                elevation: 0,
                leading: IconButton(
                  icon: const Icon(
                    Icons.arrow_back_ios,
                    color: AppColors.black,
                  ),
                  onPressed: () => Navigator.pop(context),
                ),
                title: const Text(
                  'Create Account',
                  style: TextStyle(
                    color: AppColors.black,
                    fontWeight: FontWeight.bold,
                  ),
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
                          'Join TaxiTrack',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: AppColors.black,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Fill in the details below to get started',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.grey.withOpacity(0.8),
                          ),
                        ),
                        const SizedBox(height: 32),
                        Row(
                          children: [
                            Expanded(
                              child: AppTextField(
                                controller: _firstNameController,
                                labelText: 'First Name',
                                hintText: 'John',
                                prefixIcon: Icons.person_outline,
                                validator: (v) =>
                                    v!.isEmpty ? 'Required' : null,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: AppTextField(
                                controller: _lastNameController,
                                labelText: 'Last Name',
                                hintText: 'Doe',
                                prefixIcon: Icons.person_outline,
                                validator: (v) =>
                                    v!.isEmpty ? 'Required' : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        AppTextField(
                          controller: _emailController,
                          labelText: 'Email Address',
                          hintText: 'john@example.com',
                          keyboardType: TextInputType.emailAddress,
                          prefixIcon: Icons.email_outlined,
                          validator: (v) => v!.isEmpty || !v.contains('@')
                              ? 'Invalid email'
                              : null,
                        ),
                        const SizedBox(height: 20),
                        AppTextField(
                          controller: _phoneController,
                          labelText: 'Phone Number',
                          hintText: '+1 234 567 8900',
                          keyboardType: TextInputType.phone,
                          prefixIcon: Icons.phone_android,
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                        ),
                        const SizedBox(height: 20),
                        AppTextField(
                          controller: _residenceController,
                          labelText: 'City',
                          hintText: 'New York, USA',
                          prefixIcon: Icons.location_city_outlined,
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                        ),
                        const SizedBox(height: 20),
                        AppTextField(
                          controller: _passwordController,
                          labelText: 'Password',
                          hintText: '••••••••',
                          isPassword: true,
                          prefixIcon: Icons.lock_outline,
                          validator: (v) =>
                              v!.length < 6 ? 'Min 6 characters' : null,
                        ),
                        const SizedBox(height: 40),
                        AppButton(
                          text: 'Create Account',
                          isLoading: state is AuthLoading,
                          onPressed: () {
                            if (_formKey.currentState!.validate()) {
                              context.read<AuthBloc>().add(
                                SignUpRequested(
                                  firstName: _firstNameController.text,
                                  lastName: _lastNameController.text,
                                  email: _emailController.text,
                                  phoneNumber: _phoneController.text,
                                  password: _passwordController.text,
                                  residence: _residenceController.text,
                                ),
                              );
                            }
                          },
                        ),
                        const SizedBox(height: 24),
                        Center(
                          child: Text(
                            'By signing up, you agree to our Terms & Privacy Policy',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.grey.withOpacity(0.6),
                            ),
                          ),
                        ),
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
