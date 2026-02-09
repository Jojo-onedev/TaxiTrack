import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'token_service.dart';

class SocketService {
  final TokenService _tokenService;
  io.Socket? _socket;

  // Utiliser 10.0.2.2 pour l'émulateur Android vers le localhost de la machine hôte
  static const String serverUrl = 'http://10.0.2.2:5000';

  final _rideAcceptedController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _statusChangedController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _driverPositionController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _newRideController = StreamController<Map<String, dynamic>>.broadcast();
  final _connectionController = StreamController<bool>.broadcast();

  SocketService(this._tokenService);

  Stream<Map<String, dynamic>> get rideAccepted =>
      _rideAcceptedController.stream;
  Stream<Map<String, dynamic>> get statusChanged =>
      _statusChangedController.stream;
  Stream<Map<String, dynamic>> get driverPosition =>
      _driverPositionController.stream;
  Stream<Map<String, dynamic>> get newRide => _newRideController.stream;
  Stream<bool> get connectionStatus => _connectionController.stream;

  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    final token = await _tokenService.getToken();
    if (token == null) {
      debugPrint('🔌 Socket: No token found, cannot connect');
      return;
    }

    debugPrint('🔌 Socket: Connecting to $serverUrl...');

    _socket = io.io(
      serverUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .build(),
    );

    _socket!.onConnect((_) {
      debugPrint('🔌 Socket: Connected successfully');
      _connectionController.add(true);
    });

    _socket!.onDisconnect((_) {
      debugPrint('🔌 Socket: Disconnected');
      _connectionController.add(false);
    });

    _socket!.onConnectError(
      (err) => debugPrint('🔌 Socket ConnectError: $err'),
    );
    _socket!.onError((err) => debugPrint('🔌 Socket Error: $err'));

    // Registrations of events from backend
    _socket!.on('ride_accepted', (data) {
      debugPrint('🔌 Socket Event: ride_accepted');
      _rideAcceptedController.add(data);
    });

    _socket!.on('status_changed', (data) {
      debugPrint('🔌 Socket Event: status_changed -> ${data['status']}');
      _statusChangedController.add(data);
    });

    _socket!.on('driver_position', (data) {
      // Very frequent, don't print unless debugging
      _driverPositionController.add(data);
    });

    _socket!.on('new_ride_request', (data) {
      debugPrint('🔌 Socket Event: new_ride_request');
      _newRideController.add(data);
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _connectionController.add(false);
  }

  /// Partager sa position (Chauffeur seulement)
  void updateLocation(double lat, double long) {
    if (_socket?.connected == true) {
      _socket!.emit('update_location', {'lat': lat, 'long': long});
    }
  }

  void dispose() {
    disconnect();
    _rideAcceptedController.close();
    _statusChangedController.close();
    _driverPositionController.close();
    _newRideController.close();
    _connectionController.close();
  }
}
