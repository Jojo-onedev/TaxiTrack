import 'package:equatable/equatable.dart';
import 'package:taxi_track/core/auth_repository.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final String phoneNumber;
  final String password;

  const LoginRequested(this.phoneNumber, this.password);

  @override
  List<Object?> get props => [phoneNumber, password];
}

class SignUpRequested extends AuthEvent {
  final String firstName;
  final String lastName;
  final String phoneNumber;
  final String password;
  final String residence;

  const SignUpRequested({
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
    required this.password,
    required this.residence,
  });

  @override
  List<Object?> get props => [
    firstName,
    lastName,
    phoneNumber,
    password,
    residence,
  ];
}

class LogoutRequested extends AuthEvent {}

class AuthCheckRequested extends AuthEvent {}

abstract class AuthState extends Equatable {
  const AuthState();
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class Authenticated extends AuthState {
  final User user;
  const Authenticated(this.user);

  @override
  List<Object?> get props => [user];
}

class Unauthenticated extends AuthState {}

class AuthFailure extends AuthState {
  final String message;
  const AuthFailure(this.message);

  @override
  List<Object?> get props => [message];
}
