import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';

class MapService {
  MapboxMap? _mapboxMap;

  void setMapboxMap(MapboxMap mapboxMap) {
    _mapboxMap = mapboxMap;
  }

  Future<void> animateToPosition(double latitude, double longitude) async {
    if (_mapboxMap == null) return;

    final cameraOptions = CameraOptions(
      center: Point(coordinates: Position(longitude, latitude)),
      zoom: 14.0,
    );

    await _mapboxMap!.flyTo(cameraOptions, MapAnimationOptions(duration: 1000));
  }

  Future<void> addMarker(
    double latitude,
    double longitude,
    String iconName,
  ) async {
    if (_mapboxMap == null) return;

    final pointAnnotationManager = await _mapboxMap!.annotations
        .createPointAnnotationManager();

    final pointAnnotation = PointAnnotationOptions(
      geometry: Point(coordinates: Position(longitude, latitude)),
      iconImage: iconName,
      iconSize: 1.5,
    );

    await pointAnnotationManager.create(pointAnnotation);
  }
}
