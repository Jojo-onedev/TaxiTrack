import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/ride_repository.dart';
import 'package:taxi_track/features/auth/auth_bloc.dart';
import 'package:taxi_track/features/auth/auth_bloc_impl.dart' as impl;
import 'package:taxi_track/features/ride/ride_bloc.dart' as bloc;

class RideBlocImpl extends Bloc<bloc.RideEvent, bloc.RideState> {
  final RideRepository _rideRepository;
  final impl.AuthBloc _authBloc;
  StreamSubscription? _rideUpdateSubscription;

  RideBlocImpl(this._rideRepository, this._authBloc)
    : super(bloc.RideInitial()) {
    on<bloc.RequestRide>(_onRequestRide);
    on<bloc.CancelRide>(_onCancelRide);
    on<bloc.ConfirmDriver>(_onConfirmDriver);
    on<bloc.StartTrip>(_onStartTrip);
    on<bloc.CompleteRide>(_onCompleteRide);
    on<bloc.WatchRideUpdates>(_onWatchRideUpdates);
    on<bloc.CheckActiveRide>(_onCheckActiveRide);
    on<bloc.ResetRide>(_onResetRide);
  }

  Future<void> _onRequestRide(
    bloc.RequestRide event,
    Emitter<bloc.RideState> emit,
  ) async {
    final authState = _authBloc.state;
    if (authState is! Authenticated) {
      emit(const bloc.RideError('Utilisateur non authentifié'));
      return;
    }

    final clientId = authState.user.id;

    emit(bloc.RideRequesting());
    try {
      final ride = Ride(
        clientId: clientId,
        pickupAddress: event.pickupAddress,
        destinationAddress: event.destinationAddress,
        pickupLat: event.pickupLat,
        pickupLng: event.pickupLng,
        destinationLat: event.destinationLat,
        destinationLng: event.destinationLng,
        status: RideStatus.pending,
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
        final confirmedRide = ride.copyWith(status: RideStatus.accepted);
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
    await emit.forEach<Ride>(
      _rideRepository.watchRideUpdates(event.rideId),
      onData: (ride) {
        switch (ride.status) {
          case RideStatus.accepted:
            return bloc.RideDriverFound(ride);
          case RideStatus.arrived:
            return bloc.RideConfirmed(ride);
          case RideStatus.inProgress:
            return bloc.RideInProgress(ride);
          case RideStatus.completed:
            return bloc.RideCompleted(ride);
          case RideStatus.cancelled:
            return const bloc.RideCancelled('Ride was cancelled');
          default:
            return bloc.RideSearching(ride);
        }
      },
      onError: (error, stackTrace) => bloc.RideError(error.toString()),
    );
  }

  Future<void> _onCheckActiveRide(
    bloc.CheckActiveRide event,
    Emitter<bloc.RideState> emit,
  ) async {
    try {
      final ride = await _rideRepository.getActiveRide();
      if (ride != null) {
        if (ride.status == RideStatus.pending) {
          emit(bloc.RideSearching(ride));
        } else if (ride.status == RideStatus.accepted) {
          emit(bloc.RideDriverFound(ride));
        } else if (ride.status == RideStatus.arrived) {
          emit(bloc.RideConfirmed(ride));
        } else if (ride.status == RideStatus.inProgress) {
          emit(bloc.RideInProgress(ride));
        }
        add(bloc.WatchRideUpdates(ride.id!));
      } else {
        emit(bloc.RideInitial());
      }
    } catch (e) {
      emit(bloc.RideError(e.toString()));
    }
  }

  void _onResetRide(bloc.ResetRide event, Emitter<bloc.RideState> emit) {
    _rideUpdateSubscription?.cancel();
    emit(bloc.RideInitial());
  }

  @override
  Future<void> close() {
    _rideUpdateSubscription?.cancel();
    return super.close();
  }
}
