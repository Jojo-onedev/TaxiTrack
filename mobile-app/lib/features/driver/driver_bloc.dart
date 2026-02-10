import 'package:equatable/equatable.dart';
import 'package:taxi_track/core/ride_repository.dart';

abstract class DriverEvent extends Equatable {
  const DriverEvent();
  @override
  List<Object?> get props => [];
}

class ToggleOnlineStatus extends DriverEvent {
  final bool isOnline;
  const ToggleOnlineStatus(this.isOnline);

  @override
  List<Object?> get props => [isOnline];
}

class LoadAvailableRides extends DriverEvent {}

class LoadDriverStats extends DriverEvent {}

class NewRideRequestReceived extends DriverEvent {
  final Ride ride;
  const NewRideRequestReceived(this.ride);

  @override
  List<Object?> get props => [ride];
}

class AcceptRideRequest extends DriverEvent {
  final String rideId;
  const AcceptRideRequest(this.rideId);

  @override
  List<Object?> get props => [rideId];
}

class UpdateRideStatus extends DriverEvent {
  final String rideId;
  final RideStatus status;
  const UpdateRideStatus(this.rideId, this.status);

  @override
  List<Object?> get props => [rideId, status];
}

class DriverLocationUpdated extends DriverEvent {
  final double latitude;
  final double longitude;
  const DriverLocationUpdated(this.latitude, this.longitude);

  @override
  List<Object?> get props => [latitude, longitude];
}

abstract class DriverState extends Equatable {
  const DriverState();
  @override
  List<Object?> get props => [];
}

class DriverInitial extends DriverState {}

class DriverStatusLoading extends DriverState {}

class DriverStatusUpdated extends DriverState {
  final bool isOnline;
  const DriverStatusUpdated(this.isOnline);

  @override
  List<Object?> get props => [isOnline];
}

class AvailableRidesLoaded extends DriverState {
  final List<Ride> rides;
  const AvailableRidesLoaded(this.rides);

  @override
  List<Object?> get props => [rides];
}

class DriverStatsLoaded extends DriverState {
  final Map<String, dynamic> stats;
  const DriverStatsLoaded(this.stats);

  @override
  List<Object?> get props => [stats];
}

class NewRideRequestState extends DriverState {
  final Ride ride;
  const NewRideRequestState(this.ride);

  @override
  List<Object?> get props => [ride];
}

class RideAcceptedState extends DriverState {
  final Ride ride;
  const RideAcceptedState(this.ride);

  @override
  List<Object?> get props => [ride];
}

class RideUpdateState extends DriverState {
  final Ride ride;
  const RideUpdateState(this.ride);

  @override
  List<Object?> get props => [ride];
}

class LoadDriverHistory extends DriverEvent {
  final int page;
  const LoadDriverHistory({this.page = 1});

  @override
  List<Object?> get props => [page];
}

class LoadDriverEarnings extends DriverEvent {}

class DriverHistoryLoaded extends DriverState {
  final List<Map<String, dynamic>> rides;
  const DriverHistoryLoaded(this.rides);

  @override
  List<Object?> get props => [rides];
}

class DriverEarningsLoaded extends DriverState {
  final List<Map<String, dynamic>> earnings;
  const DriverEarningsLoaded(this.earnings);

  @override
  List<Object?> get props => [earnings];
}

class DriverError extends DriverState {
  final String message;
  const DriverError(this.message);

  @override
  List<Object?> get props => [message];
}
