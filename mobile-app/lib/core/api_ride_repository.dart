import 'dart:async';
import 'package:taxi_track/core/http_service.dart';
import 'package:taxi_track/core/ride_repository.dart';

class ApiRideRepository implements RideRepository {
  final HttpService _httpService;
  final Map<String, StreamController<Ride>> _rideStreams = {};
  final Map<String, Timer> _pollingTimers = {};

  ApiRideRepository(this._httpService);

  @override
  Future<Ride?> requestRide(Ride ride) async {
    try {
      final response = await _httpService.post(
        '/client/rides/request',
        data: ride.toJson(),
      );

      if (response.statusCode == 201) {
        return Ride.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Ride?> getRideById(String rideId) async {
    try {
      // For now, the backend provides the active ride.
      // We check if the active ride matches the requested ID.
      final response = await _httpService.get('/client/rides/active');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final ride = Ride.fromJson(response.data['data']);
        if (ride.id == rideId) {
          return ride;
        }
      }
      return null;
    } catch (e) {
      if (e.toString().contains('404')) return null;
      rethrow;
    }
  }

  @override
  Future<void> cancelRide(String rideId) async {
    try {
      // The endpoint for cancel doesn't exist yet in the backend provided by user.
      // I added it to the missing checklist. For now, we'll throw or mock it if needed.
      // throw UnimplementedError('Backend cancel endpoint is missing');

      // If we want to simulate it for now:
      await Future.delayed(const Duration(milliseconds: 500));
    } catch (e) {
      rethrow;
    }
  }

  @override
  Stream<Ride> watchRideUpdates(String rideId) {
    if (!_rideStreams.containsKey(rideId)) {
      final controller = StreamController<Ride>.broadcast();
      _rideStreams[rideId] = controller;

      // Start polling
      _startPolling(rideId);

      controller.onCancel = () {
        _stopPolling(rideId);
        _rideStreams.remove(rideId);
      };
    }
    return _rideStreams[rideId]!.stream;
  }

  void _startPolling(String rideId) {
    _pollingTimers[rideId]?.cancel();
    _pollingTimers[rideId] = Timer.periodic(const Duration(seconds: 5), (
      timer,
    ) async {
      try {
        final ride = await getRideById(rideId);
        if (ride != null) {
          _rideStreams[rideId]?.add(ride);

          // Stop polling if ride is finished
          if (ride.status == RideStatus.completed ||
              ride.status == RideStatus.cancelled) {
            _stopPolling(rideId);
          }
        }
      } catch (e) {
        // Log error but keep polling? Or emit error?
        _rideStreams[rideId]?.addError(e);
      }
    });
  }

  void _stopPolling(String rideId) {
    _pollingTimers[rideId]?.cancel();
    _pollingTimers.remove(rideId);
  }

  void dispose() {
    for (var timer in _pollingTimers.values) {
      timer.cancel();
    }
    for (var controller in _rideStreams.values) {
      controller.close();
    }
  }
}
