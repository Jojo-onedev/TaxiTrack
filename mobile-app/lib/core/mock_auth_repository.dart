import 'auth_repository.dart';

class MockAuthRepository implements AuthRepository {
  User? _currentUser;

  @override
  Future<User?> login(String email, String password) async {
    await Future.delayed(const Duration(seconds: 2)); // Simulate network lag

    // simple logic for demo: "driver" in password = driver
    if (password.contains("driver")) {
      _currentUser = const User(
        id: "d1",
        email: "driver@taxitrack.com",
        firstName: "Marc",
        lastName: "Chauffeur",
        phoneNumber: "0606060606",
        role: UserRole.driver,
      );
    } else {
      _currentUser = const User(
        id: "c1",
        email: "client@taxitrack.com",
        firstName: "Thomas",
        lastName: "Client",
        phoneNumber: "0707070707",
        role: UserRole.client,
      );
    }
    return _currentUser;
  }

  @override
  Future<User?> signUp({
    required String firstName,
    required String lastName,
    required String email,
    required String phoneNumber,
    required String password,
    String? residence,
  }) async {
    await Future.delayed(const Duration(seconds: 2));
    _currentUser = User(
      id: "c${DateTime.now().millisecondsSinceEpoch}",
      email: email,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      role: UserRole.client,
    );
    return _currentUser;
  }

  @override
  Future<void> logout() async {
    _currentUser = null;
  }

  @override
  Future<User?> getCurrentUser() async {
    return _currentUser;
  }
}
