import 'dart:async';
import 'package:taxi_track/core/ride_repository.dart';

class MockRideRepository implements RideRepository {
  final Map<String, Ride> _rides = {};
  final Map<String, StreamController<Ride>> _rideStreams = {};

  @override
  Future<Ride?> requestRide(Ride ride) async {
    await Future.delayed(const Duration(seconds: 2));

    final rideWithId = ride.copyWith(
      id: 'ride_${DateTime.now().millisecondsSinceEpoch}',
      status: RideStatus.searching,
      requestedAt: DateTime.now(),
      estimatedPrice: 25.0 + (ride.pickupLat - ride.destinationLat).abs() * 10,
    );

    _rides[rideWithId.id!] = rideWithId;

    // Simulate driver acceptance after 5 seconds
    _simulateDriverAcceptance(rideWithId);

    return rideWithId;
  }

  void _simulateDriverAcceptance(Ride ride) {
    Future.delayed(const Duration(seconds: 5), () {
      final updatedRide = ride.copyWith(
        status: RideStatus.driverAccepted,
        driverId: 'driver_001',
        driverName: 'Marc Chauffeur',
      );
      _rides[ride.id!] = updatedRide;
      _rideStreams[ride.id!]?.add(updatedRide);
    });
  }

  @override
  Future<Ride?> getRideById(String rideId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _rides[rideId];
  }

  @override
  Future<void> cancelRide(String rideId) async {
    await Future.delayed(const Duration(seconds: 1));
    final ride = _rides[rideId];
    if (ride != null) {
      final cancelledRide = ride.copyWith(status: RideStatus.cancelled);
      _rides[rideId] = cancelledRide;
      _rideStreams[rideId]?.add(cancelledRide);
    }
  }

  @override
  Stream<Ride> watchRideUpdates(String rideId) {
    if (!_rideStreams.containsKey(rideId)) {
      _rideStreams[rideId] = StreamController<Ride>.broadcast();
    }
    return _rideStreams[rideId]!.stream;
  }

  void dispose() {
    for (var controller in _rideStreams.values) {
      controller.close();
    }
    _rideStreams.clear();
  }
}
