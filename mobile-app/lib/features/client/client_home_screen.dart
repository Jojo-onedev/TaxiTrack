import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/service_locator.dart';
import 'package:taxi_track/features/ride/ride_bloc.dart' as bloc;
import 'package:taxi_track/features/ride/ride_bloc_impl.dart';
import 'package:taxi_track/features/client/active_ride_screen.dart';
import 'package:taxi_track/features/client/client_profile_screen.dart';
import 'package:taxi_track/features/client/ride_history_screen.dart';
import 'package:taxi_track/shared/widgets/driver_info_card.dart';
import 'package:taxi_track/shared/widgets/ride_status_overlay.dart';

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
    const Center(child: Text('Notifications')), // TODO: Implement notifications
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
                color: Colors.black.withOpacity(0.1),
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

class _HomeTab extends StatelessWidget {
  const _HomeTab();

  void _showDestinationSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => _DestinationSheet(
        onDestinationSelected:
            (pickup, destination, pickupLat, pickupLng, destLat, destLng) {
              Navigator.pop(sheetContext);
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
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<RideBlocImpl, bloc.RideState>(
      listener: (context, state) {
        if (state is bloc.RideDriverFound) {
          // Auto-navigate to active ride screen when driver is found
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (_) => BlocProvider.value(
                value: context.read<RideBlocImpl>(),
                child: ActiveRideScreen(ride: state.ride),
              ),
            ),
          );
        } else if (state is bloc.RideError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      },
      builder: (context, state) {
        return Stack(
          children: [
            // Map Placeholder
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.grey[200]!, Colors.grey[100]!],
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Icon(
                        Icons.map_outlined,
                        size: 64,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Mapbox Integration',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.black,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Token required for display',
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
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

            // Destination Search Button (only show when no active ride)
            if (state is! bloc.RideSearching && state is! bloc.RideDriverFound)
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
                          color: AppColors.primary.withOpacity(0.4),
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
              const RideStatusOverlay(message: 'Searching for nearby drivers'),

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
            color: Colors.black.withOpacity(0.1),
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
  final Function(
    String pickup,
    String destination,
    double pickupLat,
    double pickupLng,
    double destLat,
    double destLng,
  )
  onDestinationSelected;

  const _DestinationSheet({required this.onDestinationSelected});

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
                Row(
                  children: [
                    Icon(Icons.access_time, size: 20, color: Colors.grey[600]),
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
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildDestinationTile(
                  context,
                  'JFK International Airport',
                  '25 km away',
                  Icons.flight_takeoff,
                  40.6413,
                  -73.7781,
                ),
                _buildDestinationTile(
                  context,
                  'Central Park',
                  '5 km away',
                  Icons.park,
                  40.7829,
                  -73.9654,
                ),
                _buildDestinationTile(
                  context,
                  'Times Square',
                  '8 km away',
                  Icons.location_city,
                  40.7580,
                  -73.9855,
                ),
                _buildDestinationTile(
                  context,
                  'Brooklyn Bridge',
                  '12 km away',
                  Icons.account_balance,
                  40.7061,
                  -73.9969,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDestinationTile(
    BuildContext context,
    String name,
    String distance,
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
          distance,
          style: TextStyle(color: Colors.grey[600], fontSize: 14),
        ),
        trailing: Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: Colors.grey[400],
        ),
        onTap: () {
          // Mock pickup location (current location)
          onDestinationSelected(
            'Current Location',
            name,
            40.7128,
            -74.0060, // Mock NYC coordinates
            lat,
            lng,
          );
        },
      ),
    );
  }
}
