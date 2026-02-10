import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/driver_repository.dart';
import 'package:taxi_track/core/ride_repository.dart';
import 'package:taxi_track/core/socket_service.dart';
import 'driver_bloc.dart';

class DriverBlocImpl extends Bloc<DriverEvent, DriverState> {
  final DriverRepository _driverRepository;
  final SocketService _socketService;
  StreamSubscription? _socketSubscription;

  DriverBlocImpl(this._driverRepository, this._socketService)
    : super(DriverInitial()) {
    on<ToggleOnlineStatus>(_onToggleOnlineStatus);
    on<LoadAvailableRides>(_onLoadAvailableRides);
    on<NewRideRequestReceived>(_onNewRideRequestReceived);
    on<AcceptRideRequest>(_onAcceptRideRequest);
    on<UpdateRideStatus>(_onUpdateRideStatus);
    on<DriverLocationUpdated>(_onDriverLocationUpdated);
    on<LoadDriverStats>(_onLoadDriverStats);
    on<LoadDriverHistory>(_onLoadDriverHistory);
    on<LoadDriverEarnings>(_onLoadDriverEarnings);

    _listenToSocket();
  }

  Future<void> _onUpdateRideStatus(
    UpdateRideStatus event,
    Emitter<DriverState> emit,
  ) async {
    try {
      final ride = await _driverRepository.updateRideStatus(
        event.rideId,
        event.status,
      );
      if (ride != null) {
        emit(RideUpdateState(ride));
        // Refresh active lists
        add(LoadAvailableRides());

        // If ride is completed, refresh stats and history
        if (event.status == RideStatus.completed) {
          add(LoadDriverStats());
          add(LoadDriverEarnings());
          add(LoadDriverHistory(page: 1));
        }
      }
    } catch (e) {
      emit(DriverError(e.toString()));
    }
  }

  Future<void> _onDriverLocationUpdated(
    DriverLocationUpdated event,
    Emitter<DriverState> emit,
  ) async {
    _socketService.updateLocation(event.latitude, event.longitude);
  }

  void _listenToSocket() {
    _socketSubscription = _socketService.newRide.listen((data) {
      add(NewRideRequestReceived(Ride.fromJson(data)));
    });
  }

  Future<void> _onToggleOnlineStatus(
    ToggleOnlineStatus event,
    Emitter<DriverState> emit,
  ) async {
    emit(DriverStatusLoading());
    try {
      await _driverRepository.updateOnlineStatus(event.isOnline);
      emit(DriverStatusUpdated(event.isOnline));
    } catch (e) {
      emit(DriverError(e.toString()));
    }
  }

  Future<void> _onLoadAvailableRides(
    LoadAvailableRides event,
    Emitter<DriverState> emit,
  ) async {
    try {
      final rides = await _driverRepository.getAvailableRides();
      emit(AvailableRidesLoaded(rides));
    } catch (e) {
      emit(DriverError(e.toString()));
    }
  }

  Future<void> _onLoadDriverStats(
    LoadDriverStats event,
    Emitter<DriverState> emit,
  ) async {
    try {
      final stats = await _driverRepository.getDriverStats();
      emit(DriverStatsLoaded(stats));
    } catch (e) {
      emit(DriverError(e.toString()));
    }
  }

  Future<void> _onLoadDriverHistory(
    LoadDriverHistory event,
    Emitter<DriverState> emit,
  ) async {
    try {
      final rides = await _driverRepository.getRideHistory(page: event.page);
      emit(DriverHistoryLoaded(rides));
    } catch (e) {
      emit(DriverError(e.toString()));
    }
  }

  Future<void> _onLoadDriverEarnings(
    LoadDriverEarnings event,
    Emitter<DriverState> emit,
  ) async {
    try {
      final earnings = await _driverRepository.getEarningsHistory();
      emit(DriverEarningsLoaded(earnings));
    } catch (e) {
      emit(DriverError(e.toString()));
    }
  }

  Future<void> _onNewRideRequestReceived(
    NewRideRequestReceived event,
    Emitter<DriverState> emit,
  ) async {
    emit(NewRideRequestState(event.ride));
  }

  Future<void> _onAcceptRideRequest(
    AcceptRideRequest event,
    Emitter<DriverState> emit,
  ) async {
    try {
      print('🛠️ DriverBloc: Accepting ride ${event.rideId}');
      final ride = await _driverRepository.acceptRide(event.rideId);
      print('🛠️ DriverBloc: Ride response: $ride');
      if (ride != null) {
        print('🛠️ DriverBloc: Emitting RideAcceptedState');
        emit(RideAcceptedState(ride));
        add(LoadAvailableRides()); // Refresh list
      } else {
        print('🛠️ DriverBloc: Ride is null, update failed?');
        emit(
          const DriverError("Impossible d'accepter la course (Rèponse null)"),
        );
      }
    } catch (e, stack) {
      print('🛠️ DriverBloc: Error accepting ride: $e');
      print(stack);
      emit(DriverError(e.toString()));
    }
  }

  @override
  Future<void> close() {
    _socketSubscription?.cancel();
    return super.close();
  }
}
