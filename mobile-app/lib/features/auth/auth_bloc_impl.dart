import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/auth_repository.dart';
import 'package:taxi_track/core/socket_service.dart';
import 'auth_bloc.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;
  final SocketService _socketService;

  AuthBloc(this._authRepository, this._socketService) : super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<LoginRequested>(_onLoginRequested);
    on<SignUpRequested>(_onSignUpRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    final user = await _authRepository.getCurrentUser();
    if (user != null) {
      _socketService.connect();
      emit(Authenticated(user));
    } else {
      emit(Unauthenticated());
    }
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _authRepository.login(event.email, event.password);
      if (user != null) {
        _socketService.connect();
        emit(Authenticated(user));
      } else {
        emit(const AuthFailure('Identifiants invalides'));
      }
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onSignUpRequested(
    SignUpRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _authRepository.signUp(
        firstName: event.firstName,
        lastName: event.lastName,
        email: event.email,
        phoneNumber: event.phoneNumber,
        password: event.password,
        residence: event.residence,
      );
      if (user != null) {
        // Refresh to get full profile (residence, phone) missing in signup response
        final fullUser = await _authRepository.getCurrentUser();
        _socketService.connect();
        emit(Authenticated(fullUser ?? user));
      } else {
        emit(const AuthFailure('Erreur lors de l\'inscription'));
      }
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    _socketService.disconnect();
    await _authRepository.logout();
    emit(Unauthenticated());
  }
}
