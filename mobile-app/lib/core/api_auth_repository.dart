import 'package:dio/dio.dart';
import 'auth_repository.dart';
import 'http_service.dart';
import 'token_service.dart';

class ApiAuthRepository implements AuthRepository {
  final HttpService _httpService;
  final TokenService _tokenService;

  ApiAuthRepository(this._httpService, this._tokenService);

  @override
  Future<User?> login(String email, String password) async {
    try {
      final response = await _httpService.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200 && response.data['success']) {
        final userData = response.data['data']['user'];
        final token = response.data['data']['token'];

        await _tokenService.saveToken(token);

        return _mapToUser(userData);
      }
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? 'Erreur de connexion';
      throw Exception(message);
    }
    return null;
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
    try {
      final response = await _httpService.post(
        '/auth/register',
        data: {
          'nom': lastName,
          'prenom': firstName,
          'email': email,
          'telephone': phoneNumber,
          'password': password,
          'lieu_residence': residence,
        },
      );

      if (response.statusCode == 201 && response.data['success']) {
        final userData = response.data['data']['user'];
        final token = response.data['data']['token'];

        await _tokenService.saveToken(token);

        return _mapToUser(userData);
      }
    } on DioException catch (e) {
      final message = e.response?.data['message'] ?? 'Erreur d\'inscription';
      throw Exception(message);
    }
    return null;
  }

  @override
  Future<void> logout() async {
    await _tokenService.deleteToken();
  }

  @override
  Future<User?> getCurrentUser() async {
    try {
      final hasToken = await _tokenService.hasToken();
      if (!hasToken) return null;

      final response = await _httpService.get('/auth/me');

      if (response.statusCode == 200 && response.data['success']) {
        final userData = response.data['data'];
        return _mapToUser(userData);
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        await _tokenService.deleteToken();
        return null;
      }
      rethrow;
    } catch (e) {
      return null;
    }
    return null;
  }

  User _mapToUser(Map<String, dynamic> data) {
    return User(
      id: data['id'].toString(),
      email: data['email'] ?? '',
      firstName: data['prenom'] ?? '',
      lastName: data['nom'] ?? '',
      phoneNumber: data['telephone'] ?? '',
      role: data['role'] == 'driver' ? UserRole.driver : UserRole.client,
    );
  }
}
