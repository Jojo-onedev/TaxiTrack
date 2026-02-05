import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/app_theme.dart';
import 'package:taxi_track/core/service_locator.dart';
import 'package:taxi_track/features/auth/auth_bloc.dart';
import 'package:taxi_track/features/auth/auth_bloc_impl.dart';
import 'package:taxi_track/features/ride/ride_bloc.dart' as bloc;
import 'package:taxi_track/features/ride/ride_bloc_impl.dart';
import 'package:taxi_track/features/driver/incoming_ride_screen.dart';
import 'package:taxi_track/features/driver/driver_active_ride_screen.dart';
import 'package:taxi_track/features/driver/driver_earnings_screen.dart';
import 'package:taxi_track/features/driver/driver_history_screen.dart';
import 'package:taxi_track/features/driver/driver_profile_screen.dart';

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const _DashboardTab(),
    const DriverEarningsScreen(),
    const DriverHistoryScreen(),
    const Center(child: Text('Notifications')), // TODO: Implement notifications
  ];

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<RideBlocImpl>(),
      child: Theme(
        data: AppTheme.driverTheme,
        child: Scaffold(
          body: IndexedStack(index: _selectedIndex, children: _screens),
          bottomNavigationBar: Container(
            decoration: BoxDecoration(
              color: AppColors.driverSurface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.2),
                  blurRadius: 20,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: BottomNavigationBar(
              currentIndex: _selectedIndex,
              onTap: (index) => setState(() => _selectedIndex = index),
              backgroundColor: AppColors.driverSurface,
              selectedItemColor: AppColors.primary,
              unselectedItemColor: Colors.grey[600],
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
              type: BottomNavigationBarType.fixed,
              elevation: 0,
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.dashboard_outlined),
                  activeIcon: Icon(Icons.dashboard),
                  label: 'Dashboard',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.attach_money_outlined),
                  activeIcon: Icon(Icons.attach_money),
                  label: 'Earnings',
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
      ),
    );
  }
}

class _DashboardTab extends StatefulWidget {
  const _DashboardTab();

  @override
  State<_DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<_DashboardTab> {
  bool _isAvailable = true;

  @override
  Widget build(BuildContext context) {
    return BlocListener<RideBlocImpl, bloc.RideState>(
      listener: (context, state) {
        if (state is bloc.RideSearching && _isAvailable) {
          // Show incoming ride request
          Navigator.of(context)
              .push(
                MaterialPageRoute(
                  builder: (_) => BlocProvider.value(
                    value: context.read<RideBlocImpl>(),
                    child: IncomingRideScreen(ride: state.ride),
                  ),
                ),
              )
              .then((accepted) {
                if (accepted == true) {
                  if (!mounted) return;
                  // Navigate to active ride screen
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => BlocProvider.value(
                        value: context.read<RideBlocImpl>(),
                        child: DriverActiveRideScreen(ride: state.ride),
                      ),
                    ),
                  );
                }
              });
        }
      },
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  BlocBuilder<AuthBloc, AuthState>(
                    builder: (context, state) {
                      final name = state is Authenticated
                          ? state.user.firstName
                          : 'Driver';
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hello, $name',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[100],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Ready to hit the road?',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[400],
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => DriverProfileScreen(),
                        ),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.driverSurface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.grey[800]!),
                      ),
                      child: Icon(
                        Icons.person_outline,
                        color: Colors.grey[300],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Availability Card
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: _isAvailable
                        ? [
                            AppColors.primary,
                            AppColors.primary.withValues(alpha: 0.8),
                          ]
                        : [Colors.grey[800]!, Colors.grey[900]!],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color:
                          (_isAvailable ? AppColors.primary : Colors.grey[900]!)
                              .withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isAvailable ? 'Online' : 'Offline',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _isAvailable
                                  ? 'Accepting rides'
                                  : 'Not accepting rides',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white.withValues(alpha: 0.8),
                              ),
                            ),
                          ],
                        ),
                        Switch(
                          value: _isAvailable,
                          onChanged: (value) {
                            setState(() => _isAvailable = value);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  value
                                      ? 'You are now online and accepting rides'
                                      : 'You are now offline',
                                ),
                                backgroundColor: value
                                    ? AppColors.success
                                    : Colors.grey[700],
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          activeThumbColor: Colors.white,
                          activeTrackColor: Colors.white.withValues(alpha: 0.3),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Stats Cards
              Text(
                'Today\'s Stats',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[100],
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      '12',
                      'Rides',
                      Icons.local_taxi,
                      AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard(
                      '\$245',
                      'Earnings',
                      Icons.attach_money,
                      AppColors.success,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      '4.8',
                      'Rating',
                      Icons.star,
                      Colors.amber,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard(
                      '6.5h',
                      'Online',
                      Icons.access_time,
                      Colors.blue,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String value,
    String label,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.driverSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[800]!),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.grey[100],
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: TextStyle(fontSize: 14, color: Colors.grey[500])),
        ],
      ),
    );
  }
}
