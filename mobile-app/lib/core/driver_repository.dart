import 'ride_repository.dart';

abstract class DriverRepository {
  Future<void> updateOnlineStatus(bool isOnline);
  Future<List<Ride>> getAvailableRides();
  Future<Ride?> acceptRide(String rideId);
  Future<Ride?> updateRideStatus(String rideId, RideStatus status);
  Future<Map<String, dynamic>> getDriverStats();
  Future<List<Map<String, dynamic>>> getRideHistory({int page = 1});
  Future<List<Map<String, dynamic>>> getEarningsHistory();
}
