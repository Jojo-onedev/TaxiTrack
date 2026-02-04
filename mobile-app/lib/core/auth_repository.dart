import 'package:equatable/equatable.dart';

enum UserRole { client, driver }

class User extends Equatable {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String phoneNumber;
  final UserRole role;

  const User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
    required this.role,
  });

  @override
  List<Object?> get props => [
    id,
    email,
    firstName,
    lastName,
    phoneNumber,
    role,
  ];
}

abstract class AuthRepository {
  Future<User?> login(String email, String password);
  Future<User?> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String phoneNumber,
    required String password,
    String? residence,
  });
  Future<void> logout();
  Future<User?> getCurrentUser();
}
