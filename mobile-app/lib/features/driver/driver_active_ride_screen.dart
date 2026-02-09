import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:geolocator/geolocator.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/ride_repository.dart';
import 'package:taxi_track/features/driver/driver_bloc.dart' as driver_bloc;
import 'package:taxi_track/features/driver/driver_bloc_impl.dart';
import 'package:taxi_track/shared/widgets/client_info_card.dart';
import 'package:taxi_track/shared/widgets/app_button.dart';

class DriverActiveRideScreen extends StatefulWidget {
  final Ride ride;

  const DriverActiveRideScreen({super.key, required this.ride});

  @override
  State<DriverActiveRideScreen> createState() => _DriverActiveRideScreenState();
}

class _DriverActiveRideScreenState extends State<DriverActiveRideScreen> {
  late Timer _timer;
  int _elapsedSeconds = 0;
  StreamSubscription<Position>? _positionSubscription;
  late Ride _currentRide;

  @override
  void initState() {
    super.initState();
    _currentRide = widget.ride;
    _startTimer();
    _startLocationStreaming();
  }

  void _startLocationStreaming() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    if (permission == LocationPermission.deniedForever) return;

    _positionSubscription =
        Geolocator.getPositionStream(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            distanceFilter: 10,
          ),
        ).listen((Position position) {
          if (mounted) {
            context.read<DriverBlocImpl>().add(
              driver_bloc.DriverLocationUpdated(
                position.latitude,
                position.longitude,
              ),
            );
          }
        });
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _elapsedSeconds++);
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _positionSubscription?.cancel();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final secs = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  String _getTripStateTitle(Ride ride) {
    switch (ride.status) {
      case RideStatus.accepted:
        return 'Going to Pickup';
      case RideStatus.arrived:
        return 'Arrived at Pickup';
      case RideStatus.inProgress:
        return 'Trip in Progress';
      default:
        return 'Active Trip';
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<DriverBlocImpl, driver_bloc.DriverState>(
      listener: (context, state) {
        if (state is driver_bloc.RideUpdateState) {
          setState(() {
            _currentRide = state.ride;
          });

          if (state.ride.status == RideStatus.completed) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Course terminée ! Prix : ${state.ride.estimatedPrice?.toStringAsFixed(0) ?? '0'} CFA',
                ),
                backgroundColor: AppColors.success,
              ),
            );
            Navigator.of(context).pop();
          } else if (state.ride.status == RideStatus.cancelled) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Course annulée.'),
                backgroundColor: AppColors.error,
              ),
            );
            Navigator.of(context).pop();
          }
        } else if (state is driver_bloc.RideAcceptedState) {
          setState(() {
            _currentRide = state.ride;
          });
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.driverPrimary,
        body: Stack(
          children: [
            // Map Placeholder
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Colors.grey[900]!, Colors.grey[800]!],
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppColors.driverSurface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey[700]!),
                      ),
                      child: Icon(
                        Icons.navigation,
                        size: 64,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      _getTripStateTitle(_currentRide),
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[100],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${_currentRide.pickupAddress} → ${_currentRide.destinationAddress}',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 14, color: Colors.grey[400]),
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
                    _buildTopButton(
                      icon: Icons.arrow_back,
                      onPressed: () => Navigator.pop(context),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.driverSurface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey[700]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.timer, color: AppColors.primary, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            _formatDuration(_elapsedSeconds),
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[100],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 48), // Balance for back button
                  ],
                ),
              ),
            ),

            // Bottom Sheet
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.driverSurface,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(24),
                  ),
                  border: Border(top: BorderSide(color: Colors.grey[800]!)),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Client Info
                        ClientInfoCard(
                          clientName: _currentRide.clientName ?? 'Client',
                          rating: 4.5,
                          onCall: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('📞 Calling client...'),
                              ),
                            );
                          },
                          onMessage: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('💬 Opening messages...'),
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 20),

                        // Trip Info
                        _buildTripInfo(_currentRide),
                        const SizedBox(height: 20),

                        // Action Buttons based on state
                        _buildActionButtons(context, _currentRide),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.driverSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey[700]!),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(14),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Icon(icon, color: Colors.grey[100]),
          ),
        ),
      ),
    );
  }

  Widget _buildTripInfo(Ride ride) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.driverPrimary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[800]!),
      ),
      child: Column(
        children: [
          _buildInfoRow(Icons.location_on, 'Pickup', ride.pickupAddress),
          const SizedBox(height: 12),
          _buildInfoRow(Icons.flag, 'Destination', ride.destinationAddress),
          const SizedBox(height: 12),
          _buildInfoRow(
            Icons.attach_money,
            'Fare',
            '${ride.estimatedPrice?.toStringAsFixed(0) ?? '0'} CFA',
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[100],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(BuildContext context, Ride ride) {
    switch (ride.status) {
      case RideStatus.accepted:
        return AppButton(
          text: 'I\'ve Arrived',
          onPressed: () {
            // Mark as arrived
            context.read<DriverBlocImpl>().add(
              driver_bloc.UpdateRideStatus(ride.id!, RideStatus.arrived),
            );
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Marked as arrived at pickup'),
                backgroundColor: AppColors.success,
              ),
            );
          },
        );

      case RideStatus.arrived:
        return AppButton(
          text: 'Start Trip',
          onPressed: () {
            context.read<DriverBlocImpl>().add(
              driver_bloc.UpdateRideStatus(ride.id!, RideStatus.inProgress),
            );
          },
        );

      case RideStatus.inProgress:
        return Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () => _showCancelDialog(context),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: AppColors.error, width: 2),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Cancel',
                  style: TextStyle(
                    color: AppColors.error,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppButton(
                text: 'Complete Trip',
                onPressed: () {
                  context.read<DriverBlocImpl>().add(
                    driver_bloc.UpdateRideStatus(
                      ride.id!,
                      RideStatus.completed,
                    ),
                  );
                  // Navigation handled by BlocListener
                },
              ),
            ),
          ],
        );

      default:
        return const SizedBox.shrink();
    }
  }

  void _showCancelDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: AppColors.driverSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Cancel Trip?', style: TextStyle(color: Colors.grey[100])),
        content: Text(
          'Are you sure you want to cancel this trip?',
          style: TextStyle(color: Colors.grey[400]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text('No', style: TextStyle(color: Colors.grey[400])),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              context.read<DriverBlocImpl>().add(
                driver_bloc.UpdateRideStatus(
                  widget.ride.id!,
                  RideStatus.cancelled,
                ),
              );
              Navigator.of(context).pop(); // Close screen on cancel
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }
}
