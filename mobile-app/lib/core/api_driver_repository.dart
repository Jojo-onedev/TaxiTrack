import 'package:taxi_track/core/http_service.dart';
import 'package:taxi_track/core/ride_repository.dart';
import 'driver_repository.dart';

class ApiDriverRepository implements DriverRepository {
  final HttpService _httpService;

  ApiDriverRepository(this._httpService);

  @override
  Future<void> updateOnlineStatus(bool isOnline) async {
    await _httpService.patch('/driver/status', data: {'is_online': isOnline});
  }

  @override
  Future<List<Ride>> getAvailableRides() async {
    final response = await _httpService.get('/driver/rides/available');
    if (response.data['success']) {
      final List ridesJson = response.data['data']['rides'];
      return ridesJson.map((json) => Ride.fromJson(json)).toList();
    }
    return [];
  }

  @override
  Future<Ride?> acceptRide(String rideId) async {
    final response = await _httpService.post('/driver/rides/$rideId/accept');
    if (response.data['success']) {
      return Ride.fromJson(response.data['data']['ride']);
    }
    return null;
  }

  @override
  Future<Ride?> updateRideStatus(String rideId, RideStatus status) async {
    String? statusStr;
    switch (status) {
      case RideStatus.arrived:
        statusStr = 'arrived';
        break;
      case RideStatus.inProgress:
        statusStr = 'in_progress';
        break;
      case RideStatus.completed:
        statusStr = 'completed';
        break;
      default:
        return null;
    }

    final response = await _httpService.patch(
      '/driver/rides/$rideId/update-status',
      data: {'status': statusStr},
    );
    if (response.data['success']) {
      // The update-status response in backend often returns partial ride or different structure
      // Let's check Ride.fromJson again to be safe
      return Ride.fromJson(response.data['data']['ride']);
    }
    return null;
  }

  @override
  Future<Map<String, dynamic>> getDriverStats() async {
    final response = await _httpService.get('/driver/stats/summary');
    if (response.data['success']) {
      return response.data['data'];
    }
    return {};
  }

  @override
  Future<List<Map<String, dynamic>>> getRideHistory({int page = 1}) async {
    final response = await _httpService.get(
      '/driver/rides/history',
      queryParameters: {'page': page, 'limit': 20},
    );
    if (response.data['success']) {
      return List<Map<String, dynamic>>.from(response.data['data']['rides']);
    }
    return [];
  }

  @override
  Future<List<Map<String, dynamic>>> getEarningsHistory() async {
    final response = await _httpService.get('/driver/earnings/history');
    if (response.data['success']) {
      return List<Map<String, dynamic>>.from(response.data['data']['earnings']);
    }
    return [];
  }
}
