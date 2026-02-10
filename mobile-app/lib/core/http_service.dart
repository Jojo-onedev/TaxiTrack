import 'package:dio/dio.dart';
import 'token_service.dart';

class HttpService {
  final Dio dio;
  final TokenService _tokenService;

  // Utiliser 10.0.2.2 pour l'émulateur Android vers le localhost de la machine hôte
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  HttpService(this._tokenService)
    : dio = Dio(
        BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 3),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // Logique globale de gestion des erreurs (ex: logout si 401)
          if (e.response?.statusCode == 401) {
            _tokenService.deleteToken();
          }
          return handler.next(e);
        },
      ),
    );

    // Ajouter un logger simple en mode debug
    dio.interceptors.add(LogInterceptor(requestBody: true, responseBody: true));
  }

  // Méthodes utilitaires pour simplifier les appels dans les repositories
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) {
    return dio.put(path, data: data);
  }

  Future<Response> patch(String path, {dynamic data}) {
    return dio.patch(path, data: data);
  }

  Future<Response> delete(String path, {dynamic data}) {
    return dio.delete(path, data: data);
  }
}
