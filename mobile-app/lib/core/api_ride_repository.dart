import 'dart:async';
import 'package:dio/dio.dart';
import 'package:taxi_track/core/http_service.dart';
import 'package:taxi_track/core/ride_repository.dart';
import 'package:taxi_track/core/socket_service.dart';

class ApiRideRepository implements RideRepository {
  final HttpService _httpService;
  final SocketService _socketService;
  final Map<String, StreamController<Ride>> _rideStreams = {};

  ApiRideRepository(this._httpService, this._socketService);

  @override
  Future<Ride?> requestRide(Ride ride) async {
    try {
      final response = await _httpService.post(
        '/client/rides/request',
        data: ride.toJson(),
      );

      if (response.statusCode == 201) {
        return Ride.fromJson(response.data['data']['ride']);
      }
      return null;
    } catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(dynamic e) {
    if (e is DioException) {
      if (e.response?.data != null && e.response?.data is Map) {
        final message = e.response?.data['message'];
        if (message != null) return message.toString();
      }
      return e.message ?? 'Une erreur est survenue';
    }
    return e.toString();
  }

  @override
  Future<Ride?> getRideById(String rideId) async {
    try {
      final response = await _httpService.get('/client/rides/$rideId');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final rideData = response.data['data'];
        if (rideData == null || rideData['ride'] == null) return null;

        return Ride.fromJson(rideData['ride']);
      }
      return null;
    } catch (e) {
      if (e.toString().contains('404')) return null;
      throw _handleError(e);
    }
  }

  @override
  Future<Ride?> getActiveRide() async {
    try {
      final response = await _httpService.get('/client/rides/active');

      if (response.statusCode == 200 && response.data['success'] == true) {
        final rideData = response.data['data'];
        if (rideData == null || rideData['ride'] == null) return null;

        return Ride.fromJson(rideData['ride']);
      }
      return null;
    } catch (e) {
      if (e.toString().contains('404')) return null;
      throw _handleError(e);
    }
  }

  @override
  Future<void> cancelRide(String rideId) async {
    try {
      await _httpService.post('/client/rides/$rideId/cancel');
    } catch (e) {
      throw _handleError(e);
    }
  }

  @override
  Stream<Ride> watchRideUpdates(String rideId) {
    if (!_rideStreams.containsKey(rideId)) {
      final controller = StreamController<Ride>.broadcast();
      _rideStreams[rideId] = controller;

      // Abonnement aux changements de statut via Socket
      final statusSub = _socketService.statusChanged.listen((data) {
        if (data['ride_id'].toString() == rideId) {
          _refreshRide(rideId, controller);
        }
      });

      // Abonnement à l'acceptation par un chauffeur
      final acceptedSub = _socketService.rideAccepted.listen((data) {
        if (data['ride_id'].toString() == rideId) {
          _refreshRide(rideId, controller);
        }
      });

      controller.onCancel = () {
        statusSub.cancel();
        acceptedSub.cancel();
        _rideStreams.remove(rideId);
      };
    }
    return _rideStreams[rideId]!.stream;
  }

  Future<void> _refreshRide(
    String rideId,
    StreamController<Ride> controller,
  ) async {
    try {
      final ride = await getRideById(rideId);
      if (ride != null) {
        controller.add(ride);
        if (ride.status == RideStatus.completed ||
            ride.status == RideStatus.cancelled) {
          controller.close();
        }
      }
    } catch (e) {
      controller.addError(e);
    }
  }

  void dispose() {
    for (var controller in _rideStreams.values) {
      controller.close();
    }
  }
}
