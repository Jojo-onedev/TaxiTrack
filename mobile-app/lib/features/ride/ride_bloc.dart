import 'package:equatable/equatable.dart';
import 'package:taxi_track/core/ride_repository.dart';

// Events
abstract class RideEvent extends Equatable {
  const RideEvent();

  @override
  List<Object?> get props => [];
}

class RequestRide extends RideEvent {
  final String pickupAddress;
  final String destinationAddress;
  final double pickupLat;
  final double pickupLng;
  final double destinationLat;
  final double destinationLng;

  const RequestRide({
    required this.pickupAddress,
    required this.destinationAddress,
    required this.pickupLat,
    required this.pickupLng,
    required this.destinationLat,
    required this.destinationLng,
  });

  @override
  List<Object?> get props => [
    pickupAddress,
    destinationAddress,
    pickupLat,
    pickupLng,
    destinationLat,
    destinationLng,
  ];
}

class CancelRide extends RideEvent {
  final String rideId;
  const CancelRide(this.rideId);

  @override
  List<Object?> get props => [rideId];
}

class ConfirmDriver extends RideEvent {
  final String rideId;
  const ConfirmDriver(this.rideId);

  @override
  List<Object?> get props => [rideId];
}

class StartTrip extends RideEvent {
  final String rideId;
  const StartTrip(this.rideId);

  @override
  List<Object?> get props => [rideId];
}

class CompleteRide extends RideEvent {
  final String rideId;
  const CompleteRide(this.rideId);

  @override
  List<Object?> get props => [rideId];
}

class WatchRideUpdates extends RideEvent {
  final String rideId;
  const WatchRideUpdates(this.rideId);

  @override
  List<Object?> get props => [rideId];
}

// States
abstract class RideState extends Equatable {
  const RideState();

  @override
  List<Object?> get props => [];
}

class RideInitial extends RideState {}

class RideRequesting extends RideState {}

class RideSearching extends RideState {
  final Ride ride;
  const RideSearching(this.ride);

  @override
  List<Object?> get props => [ride];
}

class RideDriverFound extends RideState {
  final Ride ride;
  const RideDriverFound(this.ride);

  @override
  List<Object?> get props => [ride];
}

class RideConfirmed extends RideState {
  final Ride ride;
  const RideConfirmed(this.ride);

  @override
  List<Object?> get props => [ride];
}

class RideInProgress extends RideState {
  final Ride ride;
  const RideInProgress(this.ride);

  @override
  List<Object?> get props => [ride];
}

class RideCompleted extends RideState {
  final Ride ride;
  const RideCompleted(this.ride);

  @override
  List<Object?> get props => [ride];
}

class RideCancelled extends RideState {
  final String message;
  const RideCancelled(this.message);

  @override
  List<Object?> get props => [message];
}

class RideError extends RideState {
  final String message;
  const RideError(this.message);

  @override
  List<Object?> get props => [message];
}
