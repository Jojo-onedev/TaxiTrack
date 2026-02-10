import 'package:equatable/equatable.dart';

enum RideStatus {
  pending,
  accepted,
  arrived,
  inProgress,
  completed,
  cancelled,
  unknown,
}

class Ride extends Equatable {
  final String? id;
  final String? driverId;
  final String? driverName;
  final String? driverPhone;
  final String? carModel;
  final String? carPlate;
  final String clientId;
  final String? clientName;
  final String? clientPhone;
  final String pickupAddress;
  final String destinationAddress;
  final double pickupLat;
  final double pickupLng;
  final double destinationLat;
  final double destinationLng;
  final RideStatus status;
  final double? estimatedPrice;
  final DateTime? createdAt;

  const Ride({
    this.id,
    this.driverId,
    this.driverName,
    this.driverPhone,
    this.carModel,
    this.carPlate,
    required this.clientId,
    this.clientName,
    this.clientPhone,
    required this.pickupAddress,
    required this.destinationAddress,
    required this.pickupLat,
    required this.pickupLng,
    required this.destinationLat,
    required this.destinationLng,
    required this.status,
    this.estimatedPrice,
    this.createdAt,
  });

  factory Ride.fromJson(Map<String, dynamic> json) {
    // Handling nested structure from clientController.js output
    // data: { ride: { ... } } or just { ... }
    final rideData = json['ride'] ?? json;

    final pickup = rideData['pickup'] ?? {};
    final dest = rideData['destination'] ?? {};
    final driver = rideData['driver'];
    final client = rideData['client'];

    return Ride(
      id: (rideData['id'] ?? rideData['_id'] ?? rideData['ride_id'])
          ?.toString(),
      clientId:
          rideData['client_id']?.toString() ??
          rideData['user_id']?.toString() ??
          '',
      clientName: client != null ? client['name'] : rideData['client_name'],
      clientPhone: client != null ? client['phone'] : rideData['client_phone'],
      pickupAddress: pickup['address'] ?? rideData['depart_address'] ?? '',
      pickupLat: (pickup['lat'] ?? rideData['depart_lat'] ?? 0.0).toDouble(),
      pickupLng: (pickup['long'] ?? rideData['depart_long'] ?? 0.0).toDouble(),
      destinationAddress: dest['address'] ?? rideData['dest_address'] ?? '',
      destinationLat: (dest['lat'] ?? rideData['dest_lat'] ?? 0.0).toDouble(),
      destinationLng: (dest['long'] ?? rideData['dest_long'] ?? 0.0).toDouble(),
      status: _parseStatus(rideData['status']),
      estimatedPrice:
          (rideData['estimated_price'] ??
                  rideData['price'] ??
                  rideData['prix'] ??
                  0.0)
              .toDouble(),
      createdAt: rideData['created_at'] != null
          ? DateTime.parse(rideData['created_at'])
          : null,
      driverId: rideData['driver_id']?.toString(),
      driverName: driver != null ? driver['name'] : null,
      driverPhone: driver != null ? driver['phone'] : null,
      carModel: (driver != null && driver['car'] != null)
          ? driver['car']['model']
          : null,
      carPlate: (driver != null && driver['car'] != null)
          ? driver['car']['plate']
          : null,
    );
  }

  static RideStatus _parseStatus(String? status) {
    switch (status) {
      case 'pending':
        return RideStatus.pending;
      case 'accepted':
        return RideStatus.accepted;
      case 'arrived':
        return RideStatus.arrived;
      case 'in_progress':
        return RideStatus.inProgress;
      case 'completed':
        return RideStatus.completed;
      case 'cancelled':
        return RideStatus.cancelled;
      default:
        return RideStatus.unknown;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'pickup_address': pickupAddress,
      'pickup_lat': pickupLat,
      'pickup_long': pickupLng,
      'dest_address': destinationAddress,
      'dest_lat': destinationLat,
      'dest_long': destinationLng,
    };
  }

  Ride copyWith({
    String? id,
    String? driverId,
    String? driverName,
    String? driverPhone,
    String? carModel,
    String? carPlate,
    String? clientId,
    String? clientName,
    String? clientPhone,
    String? pickupAddress,
    String? destinationAddress,
    double? pickupLat,
    double? pickupLng,
    double? destinationLat,
    double? destinationLng,
    RideStatus? status,
    double? estimatedPrice,
    DateTime? createdAt,
  }) {
    return Ride(
      id: id ?? this.id,
      driverId: driverId ?? this.driverId,
      driverName: driverName ?? this.driverName,
      driverPhone: driverPhone ?? this.driverPhone,
      carModel: carModel ?? this.carModel,
      carPlate: carPlate ?? this.carPlate,
      clientId: clientId ?? this.clientId,
      clientName: clientName ?? this.clientName,
      clientPhone: clientPhone ?? this.clientPhone,
      pickupAddress: pickupAddress ?? this.pickupAddress,
      destinationAddress: destinationAddress ?? this.destinationAddress,
      pickupLat: pickupLat ?? this.pickupLat,
      pickupLng: pickupLng ?? this.pickupLng,
      destinationLat: destinationLat ?? this.destinationLat,
      destinationLng: destinationLng ?? this.destinationLng,
      status: status ?? this.status,
      estimatedPrice: estimatedPrice ?? this.estimatedPrice,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    driverId,
    driverName,
    driverPhone,
    carModel,
    carPlate,
    clientId,
    clientName,
    clientPhone,
    pickupAddress,
    destinationAddress,
    pickupLat,
    pickupLng,
    destinationLat,
    destinationLng,
    status,
    estimatedPrice,
    createdAt,
  ];
}

abstract class RideRepository {
  Future<Ride?> requestRide(Ride ride);
  Future<Ride?> getRideById(String rideId);
  Future<Ride?> getActiveRide();
  Future<void> cancelRide(String rideId);
  Future<List<Ride>> getRideHistory();
  Stream<Ride> watchRideUpdates(String rideId);
}
