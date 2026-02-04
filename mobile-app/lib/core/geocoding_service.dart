import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';

class SearchSuggestion {
  final String label;
  final String city;
  final LatLng coordinates;

  SearchSuggestion({
    required this.label,
    required this.city,
    required this.coordinates,
  });

  factory SearchSuggestion.fromJson(Map<String, dynamic> json) {
    final properties = json['properties'] ?? {};
    final geometry = json['geometry'] ?? {};
    final coordinates = geometry['coordinates'] as List;

    return SearchSuggestion(
      label: properties['name'] ?? properties['street'] ?? 'Unknown location',
      city: properties['city'] ?? properties['state'] ?? '',
      coordinates: LatLng(coordinates[1], coordinates[0]),
    );
  }
}

class GeocodingService {
  static const String _baseUrl = 'https://photon.komoot.io/api';

  Future<List<SearchSuggestion>> search(String query) async {
    if (query.length < 3) return [];

    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/?q=${Uri.encodeComponent(query)}&limit=5'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final features = data['features'] as List;
        return features.map((f) => SearchSuggestion.fromJson(f)).toList();
      }
      return [];
    } catch (e) {
      print('Geocoding error: $e');
      return [];
    }
  }
}
