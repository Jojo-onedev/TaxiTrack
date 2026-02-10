import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class MapService {
  MapController? _mapController;

  void setMapController(MapController controller) {
    _mapController = controller;
  }

  void animateToPosition(double latitude, double longitude) {
    if (_mapController == null) return;
    _mapController!.move(LatLng(latitude, longitude), 14.0);
  }

  void fitBounds(LatLng point1, LatLng point2) {
    if (_mapController == null) return;
    final bounds = LatLngBounds(point1, point2);
    _mapController!.fitCamera(
      CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(50)),
    );
  }
}
