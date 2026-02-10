import 'package:get_it/get_it.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'auth_repository.dart';
import 'api_auth_repository.dart';
import 'ride_repository.dart';
import 'package:taxi_track/features/auth/auth_bloc_impl.dart';
import 'api_ride_repository.dart';
import 'token_service.dart';
import 'http_service.dart';
import 'geocoding_service.dart';
import 'map_service.dart';
import 'location_service.dart';
import 'socket_service.dart';
import 'driver_repository.dart';
import 'api_driver_repository.dart';
import 'package:taxi_track/features/ride/ride_bloc_impl.dart';
import 'package:taxi_track/features/driver/driver_bloc_impl.dart';
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
  sl.registerLazySingleton<SocketService>(() => SocketService(sl()));

  // Repositories
  sl.registerLazySingleton<AuthRepository>(() => ApiAuthRepository(sl(), sl()));
  sl.registerLazySingleton<RideRepository>(() => ApiRideRepository(sl(), sl()));
  sl.registerLazySingleton<DriverRepository>(() => ApiDriverRepository(sl()));

  // BLoCs - Factory for new instances
  sl.registerLazySingleton<AuthBloc>(
    () => AuthBloc(sl<AuthRepository>(), sl<SocketService>()),
  );
  sl.registerFactory<RideBlocImpl>(
    () => RideBlocImpl(sl<RideRepository>(), sl<AuthBloc>()),
  );
  sl.registerLazySingleton<DriverBlocImpl>(
    () => DriverBlocImpl(sl<DriverRepository>(), sl<SocketService>()),
  );
  sl.registerFactory<SearchBloc>(() => SearchBloc(sl<GeocodingService>()));
}
