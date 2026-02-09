import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/app_theme.dart';
import 'package:taxi_track/core/service_locator.dart';
import 'package:taxi_track/features/auth/auth_bloc.dart';
import 'package:taxi_track/features/auth/auth_bloc_impl.dart';
import 'package:taxi_track/features/driver/driver_bloc.dart' as driver_bloc;
import 'package:taxi_track/features/driver/driver_bloc_impl.dart';
import 'package:taxi_track/features/driver/incoming_ride_screen.dart';
import 'package:taxi_track/features/driver/driver_active_ride_screen.dart';
import 'package:taxi_track/features/driver/driver_history_tab.dart';
import 'package:taxi_track/features/driver/driver_earnings_tab.dart';
import 'package:taxi_track/features/ride/ride_bloc_impl.dart';
import 'package:taxi_track/core/ride_repository.dart';

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const _DashboardTab(),
    const DriverEarningsTab(),
    const DriverHistoryTab(),
    const _DriverNotificationsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Theme(
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
    );
  }
}

class _DashboardTab extends StatefulWidget {
  const _DashboardTab();

  @override
  State<_DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<_DashboardTab> {
  @override
  Widget build(BuildContext context) {
    return BlocListener<DriverBlocImpl, driver_bloc.DriverState>(
      listener: (context, state) {
        if (state is driver_bloc.DriverInitial) {
          context.read<DriverBlocImpl>().add(driver_bloc.LoadDriverStats());
        }
        if (state is driver_bloc.NewRideRequestState) {
          Navigator.of(context)
              .push(
                MaterialPageRoute(
                  builder: (_) => MultiBlocProvider(
                    providers: [
                      BlocProvider.value(value: context.read<DriverBlocImpl>()),
                      BlocProvider(create: (_) => sl<RideBlocImpl>()),
                    ],
                    child: IncomingRideScreen(ride: state.ride),
                  ),
                ),
              )
              .then((result) {
                if (result != null && result is Ride) {
                  // Navigation to Active Ride Screen upon successful acceptance
                  if (!context.mounted) return;
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => BlocProvider(
                        create: (_) => sl<RideBlocImpl>(),
                        child: DriverActiveRideScreen(ride: result),
                      ),
                    ),
                  );
                }
              });
        }
        // Removed RideAcceptedState listener to prevent race conditions
        // with IncomingRideScreen popping.
        else if (state is driver_bloc.DriverError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
            ),
          );
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
                          const SizedBox(height: 8),
                          BlocBuilder<DriverBlocImpl, driver_bloc.DriverState>(
                            builder: (context, state) {
                              bool isOnline = false;
                              if (state is driver_bloc.DriverStatusUpdated) {
                                isOnline = state.isOnline;
                              }
                              return Text(
                                isOnline ? 'En ligne' : 'Hors ligne',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              );
                            },
                          ),
                        ],
                      );
                    },
                  ),
                  BlocBuilder<DriverBlocImpl, driver_bloc.DriverState>(
                    builder: (context, state) {
                      bool isOnline = false;
                      if (state is driver_bloc.DriverStatusUpdated) {
                        isOnline = state.isOnline;
                      }
                      return Switch(
                        value: isOnline,
                        onChanged: (value) {
                          context.read<DriverBlocImpl>().add(
                            driver_bloc.ToggleOnlineStatus(value),
                          );
                        },
                        activeThumbColor: Colors.white,
                        activeTrackColor: Colors.white30,
                      );
                    },
                  ),
                ],
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
              BlocBuilder<DriverBlocImpl, driver_bloc.DriverState>(
                buildWhen: (prev, curr) =>
                    curr is driver_bloc.DriverStatsLoaded,
                builder: (context, state) {
                  final stats = state is driver_bloc.DriverStatsLoaded
                      ? state.stats
                      : {
                          'total_rides': 0,
                          'total_earnings': 0,
                          'average_rating': 0.0,
                          'hours_online': 0.0,
                        };

                  return Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _buildStatCard(
                              '${stats['total_rides'] ?? 0}',
                              'Rides',
                              Icons.local_taxi,
                              AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildStatCard(
                              '${stats['total_earnings'] ?? 0} CFA',
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
                              '${stats['average_rating'] ?? 0.0}',
                              'Rating',
                              Icons.star,
                              Colors.amber,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildStatCard(
                              '${stats['hours_online'] ?? 0.0}h',
                              'Online',
                              Icons.access_time,
                              Colors.blue,
                            ),
                          ),
                        ],
                      ),
                    ],
                  );
                },
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

class _DriverNotificationsTab extends StatelessWidget {
  const _DriverNotificationsTab();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.driverPrimary,
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppColors.driverPrimary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildNotificationItem(
            'Nouvelle course disponible',
            'Une course est disponible à 2.5km de votre position.',
            Icons.local_taxi,
            AppColors.primary,
            'À l\'instant',
          ),
          _buildNotificationItem(
            'Paiement reçu',
            'Vous avez reçu 4500 CFA pour votre dernière course.',
            Icons.account_balance_wallet,
            AppColors.success,
            'Il y a 30 min',
          ),
          _buildNotificationItem(
            'Promotion Chauffeur',
            'Complétez 10 courses aujourd\'hui et gagnez un bonus de 2000 CFA.',
            Icons.trending_up,
            Colors.blue,
            'Ce matin',
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem(
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
        color: AppColors.driverSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[800]!),
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
                        color: Colors.white,
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
                  style: TextStyle(color: Colors.grey[400], fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
