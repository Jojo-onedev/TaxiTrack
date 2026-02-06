import 'package:get_it/get_it.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'auth_repository.dart';
import 'api_auth_repository.dart';
import 'ride_repository.dart';
import 'mock_ride_repository.dart';
import 'token_service.dart';
import 'http_service.dart';
import 'geocoding_service.dart';
import 'map_service.dart';
import 'location_service.dart';
import 'package:taxi_track/features/ride/ride_bloc_impl.dart';
import 'package:taxi_track/features/client/search_bloc.dart';

final sl = GetIt.instance;

Future<void> initServiceLocator() async {
  // External
  sl.registerLazySingleton<FlutterSecureStorage>(
    () => const FlutterSecureStorage(),
  );

  // Services
  sl.registerLazySingleton<TokenService>(() => TokenService(sl()));
  sl.registerLazySingleton<HttpService>(() => HttpService(sl()));
  sl.registerLazySingleton<GeocodingService>(() => GeocodingService());
  sl.registerLazySingleton<MapService>(() => MapService());
  sl.registerLazySingleton<LocationService>(() => LocationService());

  // Repositories
  sl.registerLazySingleton<AuthRepository>(() => ApiAuthRepository(sl(), sl()));
  sl.registerLazySingleton<RideRepository>(() => MockRideRepository());

  // BLoCs - Factory for new instances
  sl.registerFactory<RideBlocImpl>(() => RideBlocImpl(sl<RideRepository>()));
  sl.registerFactory<SearchBloc>(() => SearchBloc(sl<GeocodingService>()));
}
