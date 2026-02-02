import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/ride_repository.dart';
import 'package:taxi_track/features/ride/ride_bloc.dart' as bloc;

class RideBlocImpl extends Bloc<bloc.RideEvent, bloc.RideState> {
  final RideRepository _rideRepository;
  StreamSubscription? _rideUpdateSubscription;

  RideBlocImpl(this._rideRepository) : super(bloc.RideInitial()) {
    on<bloc.RequestRide>(_onRequestRide);
    on<bloc.CancelRide>(_onCancelRide);
    on<bloc.ConfirmDriver>(_onConfirmDriver);
    on<bloc.StartTrip>(_onStartTrip);
    on<bloc.CompleteRide>(_onCompleteRide);
    on<bloc.WatchRideUpdates>(_onWatchRideUpdates);
  }

  Future<void> _onRequestRide(
    bloc.RequestRide event,
    Emitter<bloc.RideState> emit,
  ) async {
    emit(bloc.RideRequesting());
    try {
      final ride = Ride(
        clientId: 'mock_client_001',
        pickupAddress: event.pickupAddress,
        destinationAddress: event.destinationAddress,
        pickupLat: event.pickupLat,
        pickupLng: event.pickupLng,
        destinationLat: event.destinationLat,
        destinationLng: event.destinationLng,
        status: RideStatus.searching,
      );

      final createdRide = await _rideRepository.requestRide(ride);
      if (createdRide != null) {
        emit(bloc.RideSearching(createdRide));
        // Start watching for updates
        add(bloc.WatchRideUpdates(createdRide.id!));
      } else {
        emit(const bloc.RideError('Failed to request ride'));
      }
    } catch (e) {
      emit(bloc.RideError(e.toString()));
    }
  }

  Future<void> _onCancelRide(
    bloc.CancelRide event,
    Emitter<bloc.RideState> emit,
  ) async {
    try {
      await _rideRepository.cancelRide(event.rideId);
      emit(const bloc.RideCancelled('Ride cancelled successfully'));
      await _rideUpdateSubscription?.cancel();
    } catch (e) {
      emit(bloc.RideError(e.toString()));
    }
  }

  Future<void> _onConfirmDriver(
    bloc.ConfirmDriver event,
    Emitter<bloc.RideState> emit,
  ) async {
    try {
      final ride = await _rideRepository.getRideById(event.rideId);
      if (ride != null) {
        final confirmedRide = ride.copyWith(status: RideStatus.clientConfirmed);
        emit(bloc.RideConfirmed(confirmedRide));
      }
    } catch (e) {
      emit(bloc.RideError(e.toString()));
    }
  }

  Future<void> _onStartTrip(
    bloc.StartTrip event,
    Emitter<bloc.RideState> emit,
  ) async {
    try {
      final ride = await _rideRepository.getRideById(event.rideId);
      if (ride != null) {
        final inProgressRide = ride.copyWith(status: RideStatus.inProgress);
        emit(bloc.RideInProgress(inProgressRide));
      }
    } catch (e) {
      emit(bloc.RideError(e.toString()));
    }
  }

  Future<void> _onCompleteRide(
    bloc.CompleteRide event,
    Emitter<bloc.RideState> emit,
  ) async {
    try {
      final ride = await _rideRepository.getRideById(event.rideId);
      if (ride != null) {
        final completedRide = ride.copyWith(status: RideStatus.completed);
        emit(bloc.RideCompleted(completedRide));
        await _rideUpdateSubscription?.cancel();
      }
    } catch (e) {
      emit(bloc.RideError(e.toString()));
    }
  }

  Future<void> _onWatchRideUpdates(
    bloc.WatchRideUpdates event,
    Emitter<bloc.RideState> emit,
  ) async {
    await _rideUpdateSubscription?.cancel();
    _rideUpdateSubscription = _rideRepository
        .watchRideUpdates(event.rideId)
        .listen(
          (ride) {
            if (ride.status == RideStatus.driverAccepted) {
              emit(bloc.RideDriverFound(ride));
            } else if (ride.status == RideStatus.arrived) {
              emit(bloc.RideConfirmed(ride));
            } else if (ride.status == RideStatus.inProgress) {
              emit(bloc.RideInProgress(ride));
            } else if (ride.status == RideStatus.completed) {
              emit(bloc.RideCompleted(ride));
            } else if (ride.status == RideStatus.cancelled) {
              emit(const bloc.RideCancelled('Ride was cancelled'));
            }
          },
          onError: (error) {
            emit(bloc.RideError(error.toString()));
          },
        );
  }

  @override
  Future<void> close() {
    _rideUpdateSubscription?.cancel();
    return super.close();
  }
}
