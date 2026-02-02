import 'package:equatable/equatable.dart';

enum RideStatus {
  idle,
  searching,
  driverAccepted,
  clientConfirmed,
  arrived,
  inProgress,
  completed,
  cancelled,
}

class Ride extends Equatable {
  final String? id;
  final String? driverId;
  final String? driverName;
  final String clientId;
  final String pickupAddress;
  final String destinationAddress;
  final double pickupLat;
  final double pickupLng;
  final double destinationLat;
  final double destinationLng;
  final RideStatus status;
  final double? estimatedPrice;
  final DateTime? requestedAt;

  const Ride({
    this.id,
    this.driverId,
    this.driverName,
    required this.clientId,
    required this.pickupAddress,
    required this.destinationAddress,
    required this.pickupLat,
    required this.pickupLng,
    required this.destinationLat,
    required this.destinationLng,
    required this.status,
    this.estimatedPrice,
    this.requestedAt,
  });

  Ride copyWith({
    String? id,
    String? driverId,
    String? driverName,
    String? clientId,
    String? pickupAddress,
    String? destinationAddress,
    double? pickupLat,
    double? pickupLng,
    double? destinationLat,
    double? destinationLng,
    RideStatus? status,
    double? estimatedPrice,
    DateTime? requestedAt,
  }) {
    return Ride(
      id: id ?? this.id,
      driverId: driverId ?? this.driverId,
      driverName: driverName ?? this.driverName,
      clientId: clientId ?? this.clientId,
      pickupAddress: pickupAddress ?? this.pickupAddress,
      destinationAddress: destinationAddress ?? this.destinationAddress,
      pickupLat: pickupLat ?? this.pickupLat,
      pickupLng: pickupLng ?? this.pickupLng,
      destinationLat: destinationLat ?? this.destinationLat,
      destinationLng: destinationLng ?? this.destinationLng,
      status: status ?? this.status,
      estimatedPrice: estimatedPrice ?? this.estimatedPrice,
      requestedAt: requestedAt ?? this.requestedAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    driverId,
    driverName,
    clientId,
    pickupAddress,
    destinationAddress,
    pickupLat,
    pickupLng,
    destinationLat,
    destinationLng,
    status,
    estimatedPrice,
    requestedAt,
  ];
}

abstract class RideRepository {
  Future<Ride?> requestRide(Ride ride);
  Future<Ride?> getRideById(String rideId);
  Future<void> cancelRide(String rideId);
  Stream<Ride> watchRideUpdates(String rideId);
}
