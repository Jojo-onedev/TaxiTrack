import 'package:get_it/get_it.dart';
import 'auth_repository.dart';
import 'mock_auth_repository.dart';
import 'ride_repository.dart';
import 'mock_ride_repository.dart';
import 'package:taxi_track/features/ride/ride_bloc_impl.dart';

final sl = GetIt.instance;

Future<void> initServiceLocator() async {
  // Repositories
  sl.registerLazySingleton<AuthRepository>(() => MockAuthRepository());
  sl.registerLazySingleton<RideRepository>(() => MockRideRepository());

  // BLoCs - Factory for new instances
  sl.registerFactory<RideBlocImpl>(() => RideBlocImpl(sl<RideRepository>()));
}
