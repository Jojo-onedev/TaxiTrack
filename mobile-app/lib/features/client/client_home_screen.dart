import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/socket_service.dart';
import 'package:taxi_track/core/service_locator.dart';
import 'package:taxi_track/core/map_service.dart';
import 'package:taxi_track/features/client/active_ride_screen.dart';
import 'package:taxi_track/features/client/client_profile_screen.dart';
import 'package:taxi_track/features/client/ride_history_screen.dart';
import 'package:taxi_track/shared/widgets/driver_info_card.dart';
import 'package:taxi_track/shared/widgets/ride_status_overlay.dart';
import 'package:taxi_track/features/client/search_bloc.dart';
import 'package:taxi_track/features/ride/ride_bloc.dart' as bloc;
import 'package:taxi_track/features/ride/ride_bloc_impl.dart';
import 'package:taxi_track/core/location_service.dart';

class ClientHomeScreen extends StatefulWidget {
  const ClientHomeScreen({super.key});

  @override
  State<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends State<ClientHomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const _HomeTab(),
    const RideHistoryScreen(),
    const _ClientAlertsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<RideBlocImpl>(),
      child: Scaffold(
        body: IndexedStack(index: _selectedIndex, children: _screens),
        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: (index) => setState(() => _selectedIndex = index),
            selectedItemColor: AppColors.primary,
            unselectedItemColor: Colors.grey[400],
            selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.history_outlined),
                activeIcon: Icon(Icons.history),
                label: 'History',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.notifications_outlined),
                activeIcon: Icon(Icons.notifications),
                label: 'Alerts',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  final MapController _mapController = MapController();
  LatLng _currentLocation = const LatLng(48.8566, 2.3522); // Paris default
  LatLng? _destinationLocation;
  LatLng? _driverLocation;
  StreamSubscription? _socketSubscription;

  @override
  void initState() {
    super.initState();
    _getCurrentLocation();
    _listenToDriverPosition();
    // Check if there is an active ride to recover
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RideBlocImpl>().add(const bloc.CheckActiveRide());
    });
  }

  void _listenToDriverPosition() {
    _socketSubscription = sl<SocketService>().driverPosition.listen((data) {
      if (mounted) {
        setState(() {
          _driverLocation = LatLng(
            (data['lat'] as num).toDouble(),
            (data['long'] as num).toDouble(),
          );
        });
      }
    });
  }

  @override
  void dispose() {
    _socketSubscription?.cancel();
    super.dispose();
  }

  Future<void> _getCurrentLocation() async {
    final location = await sl<LocationService>().getCurrentLocation();
    if (location != null && mounted) {
      setState(() {
        _currentLocation = location;
      });
      _mapController.move(location, 14.0);
    }
  }

  void _showDestinationSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => BlocProvider(
        create: (context) => sl<SearchBloc>(),
        child: _DestinationSheet(
          currentLocation: _currentLocation,
          onDestinationSelected:
              (pickup, destination, pickupLat, pickupLng, destLat, destLng) {
                Navigator.pop(sheetContext);
                setState(() {
                  _destinationLocation = LatLng(destLat, destLng);
                });
                _mapController.move(_destinationLocation!, 14.0);
                context.read<RideBlocImpl>().add(
                  bloc.RequestRide(
                    pickupAddress: pickup,
                    destinationAddress: destination,
                    pickupLat: pickupLat,
                    pickupLng: pickupLng,
                    destinationLat: destLat,
                    destinationLng: destLng,
                  ),
                );
              },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<RideBlocImpl, bloc.RideState>(
      listener: (context, state) {
        if (state is bloc.RideDriverFound ||
            state is bloc.RideConfirmed ||
            state is bloc.RideInProgress) {
          final ride = (state as dynamic).ride;
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => BlocProvider.value(
                value: context.read<RideBlocImpl>(),
                child: ActiveRideScreen(ride: ride),
              ),
            ),
          );
        } else if (state is bloc.RideError) {
          final isAlreadyActive = state.message.contains(
            ' déjà une course en cours',
          );

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
              action: isAlreadyActive
                  ? SnackBarAction(
                      label: 'REPROUVER',
                      textColor: Colors.white,
                      onPressed: () {
                        context.read<RideBlocImpl>().add(
                          const bloc.CheckActiveRide(),
                        );
                      },
                    )
                  : null,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );

          if (isAlreadyActive) {
            context.read<RideBlocImpl>().add(const bloc.CheckActiveRide());
          }
        }
      },
      builder: (context, state) {
        return Stack(
          children: [
            // Map Layer
            FlutterMap(
              mapController: _mapController,
              options: MapOptions(
                initialCenter: _currentLocation,
                initialZoom: 13.0,
                onMapReady: () {
                  sl<MapService>().setMapController(_mapController);
                },
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.taxitrack.app',
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _currentLocation,
                      width: 80,
                      height: 80,
                      child: const Icon(
                        Icons.my_location,
                        color: AppColors.primary,
                        size: 40,
                      ),
                    ),
                    if (_driverLocation != null)
                      Marker(
                        point: _driverLocation!,
                        width: 80,
                        height: 80,
                        child: Transform.rotate(
                          angle: 0.0, // We could add bearing here if available
                          child: const Icon(
                            Icons.local_taxi,
                            color: AppColors.black,
                            size: 40,
                          ),
                        ),
                      ),
                    if (_destinationLocation != null)
                      Marker(
                        point: _destinationLocation!,
                        width: 80,
                        height: 80,
                        child: const Icon(
                          Icons.location_on,
                          color: AppColors.error,
                          size: 40,
                        ),
                      ),
                  ],
                ),
              ],
            ),

            // Top Bar
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildTopButton(Icons.menu, () {}),
                    _buildTopButton(Icons.person_outline, () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const ClientProfileScreen(),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),

            // My Location Button
            Positioned(
              bottom: 180,
              right: 16,
              child: _buildTopButton(Icons.my_location, _getCurrentLocation),
            ),

            // Destination Search Button (only show when no active ride)
            if (state is! bloc.RideSearching &&
                state is! bloc.RideDriverFound &&
                state is! bloc.RideConfirmed &&
                state is! bloc.RideInProgress)
              Positioned(
                bottom: 100,
                left: 16,
                right: 16,
                child: GestureDetector(
                  onTap: () => _showDestinationSheet(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 20,
                    ),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: AppColors.primaryGradient,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.search, color: Colors.white, size: 28),
                        SizedBox(width: 16),
                        Text(
                          'Where would you like to go?',
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // Searching Overlay
            if (state is bloc.RideRequesting || state is bloc.RideSearching)
              RideStatusOverlay(
                message: 'Searching for nearby drivers',
                onCancel: () {
                  final rideId = state is bloc.RideSearching
                      ? state.ride.id
                      : null;
                  if (rideId != null) {
                    context.read<RideBlocImpl>().add(bloc.CancelRide(rideId));
                  } else {
                    // Just reset the state if no ID yet (requesting phase)
                    // We might need a ResetRide state or similar
                  }
                },
              ),

            // Driver Found Card
            if (state is bloc.RideDriverFound)
              Positioned(
                bottom: 100,
                left: 16,
                right: 16,
                child: Column(
                  children: [
                    DriverInfoCard(
                      driverName: state.ride.driverName!,
                      rating: 4.8,
                      carModel: 'Toyota Camry 2022',
                      carPlate: 'ABC-1234',
                      onCall: () {},
                      onMessage: () {},
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.success,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_circle, color: Colors.white),
                          SizedBox(width: 12),
                          Text(
                            'Driver Found! Tap to view trip',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildTopButton(IconData icon, VoidCallback onPressed) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Icon(icon, color: AppColors.black),
          ),
        ),
      ),
    );
  }
}

class _DestinationSheet extends StatelessWidget {
  final LatLng currentLocation;
  final Function(
    String pickup,
    String destination,
    double pickupLat,
    double pickupLng,
    double destLat,
    double destLng,
  )
  onDestinationSelected;

  const _DestinationSheet({
    required this.currentLocation,
    required this.onDestinationSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.65,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 50,
            height: 5,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          const SizedBox(height: 24),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Where to?',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 24),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: TextField(
                    onChanged: (value) {
                      context.read<SearchBloc>().add(QueryChanged(value));
                    },
                    decoration: InputDecoration(
                      hintText: 'Search destination',
                      hintStyle: TextStyle(color: Colors.grey[500]),
                      prefixIcon: Icon(Icons.search, color: AppColors.primary),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 16,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
          Expanded(
            child: BlocBuilder<SearchBloc, SearchState>(
              builder: (context, state) {
                if (state is SearchLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (state is SearchResults) {
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: state.suggestions.length,
                    itemBuilder: (context, index) {
                      final suggestion = state.suggestions[index];
                      return _buildDestinationTile(
                        context,
                        suggestion.label,
                        suggestion.city,
                        Icons.location_on,
                        suggestion.coordinates.latitude,
                        suggestion.coordinates.longitude,
                      );
                    },
                  );
                }
                return ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.access_time,
                          size: 20,
                          color: Colors.grey[600],
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Recent Destinations',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey[700],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildDestinationTile(
                      context,
                      'JFK International Airport',
                      'New York, USA',
                      Icons.flight_takeoff,
                      40.6413,
                      -73.7781,
                    ),
                    _buildDestinationTile(
                      context,
                      'Central Park',
                      'New York, USA',
                      Icons.park,
                      40.7829,
                      -73.9654,
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDestinationTile(
    BuildContext context,
    String name,
    String subtitle,
    IconData icon,
    double lat,
    double lng,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: AppColors.primaryGradient),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: Colors.white, size: 24),
        ),
        title: Text(
          name,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(color: Colors.grey[600], fontSize: 14),
        ),
        trailing: Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: Colors.grey[400],
        ),
        onTap: () {
          onDestinationSelected(
            'Current Location',
            name,
            currentLocation.latitude,
            currentLocation.longitude,
            lat,
            lng,
          );
        },
      ),
    );
  }
}

class _ClientAlertsTab extends StatelessWidget {
  const _ClientAlertsTab();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alerts & Notifications'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.black,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildAlertItem(
            context,
            'Promotion exclusive',
            'Bénéficiez de 20% de réduction sur votre prochaine course !',
            Icons.local_offer,
            Colors.orange,
            'Il y a 2h',
          ),
          _buildAlertItem(
            context,
            'Sécurité',
            'N\'oubliez pas de vérifier la plaque d\'immatriculation avant de monter.',
            Icons.security,
            Colors.blue,
            'Hier',
          ),
          _buildAlertItem(
            context,
            'Bienvenue',
            'Merci d\'avoir rejoint TaxiTrack. Votre première course est à moitié prix !',
            Icons.star,
            AppColors.primary,
            '2 jours',
          ),
        ],
      ),
    );
  }

  Widget _buildAlertItem(
    BuildContext context,
    String title,
    String message,
    IconData icon,
    Color color,
    String time,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(
                      time,
                      style: TextStyle(color: Colors.grey[500], fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: TextStyle(color: Colors.grey[600], fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
