import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/ride_repository.dart';
import 'package:taxi_track/features/driver/driver_bloc.dart' as driver_bloc;
import 'package:taxi_track/features/driver/driver_bloc_impl.dart';
import 'package:taxi_track/shared/widgets/client_info_card.dart';

class IncomingRideScreen extends StatefulWidget {
  final Ride ride;

  const IncomingRideScreen({super.key, required this.ride});

  @override
  State<IncomingRideScreen> createState() => _IncomingRideScreenState();
}

class _IncomingRideScreenState extends State<IncomingRideScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  Timer? _autoRejectTimer;
  int _remainingSeconds = 30;
  bool _isAccepting = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.elasticOut),
    );
    _animationController.forward();

    // Auto-reject after 30 seconds
    _autoRejectTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _remainingSeconds--);
      if (_remainingSeconds <= 0) {
        timer.cancel();
        _rejectRide();
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _autoRejectTimer?.cancel();
    super.dispose();
  }

  void _acceptRide() {
    if (_isAccepting) return;
    setState(() => _isAccepting = true);

    _autoRejectTimer?.cancel();
    context.read<DriverBlocImpl>().add(
      driver_bloc.AcceptRideRequest(widget.ride.id!),
    );
  }

  void _rejectRide() {
    _autoRejectTimer?.cancel();
    // For now, simple dismissal
    Navigator.of(context).pop(false); // Return false to indicate rejection
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<DriverBlocImpl, driver_bloc.DriverState>(
      listener: (context, state) {
        print('🛠️ IncomingScreen: State received: $state');
        if (state is driver_bloc.RideAcceptedState) {
          print(
            '🛠️ IncomingScreen: RideAcceptedState received! Popping with ride...',
          );
          // Signal success to HomeScreen and pop with the ride object
          Navigator.of(context).pop(state.ride);
        } else if (state is driver_bloc.DriverError) {
          print('🛠️ IncomingScreen: DriverError received: ${state.message}');
          setState(() => _isAccepting = false);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
            ),
          );
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.driverPrimary,
        body: SafeArea(
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  // Timer
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: _remainingSeconds <= 10
                          ? AppColors.error.withValues(alpha: 0.2)
                          : AppColors.driverSurface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: _remainingSeconds <= 10
                            ? AppColors.error
                            : Colors.grey[800]!,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.timer,
                          color: _remainingSeconds <= 10
                              ? AppColors.error
                              : AppColors.primary,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '$_remainingSeconds seconds',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: _remainingSeconds <= 10
                                ? AppColors.error
                                : Colors.grey[100],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Title
                  Text(
                    'New Ride Request',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[100],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'A passenger needs a ride',
                    style: TextStyle(fontSize: 16, color: Colors.grey[400]),
                  ),
                  const SizedBox(height: 32),

                  // Client Info
                  ClientInfoCard(
                    clientName: widget.ride.clientName ?? 'Client',
                    rating: 4.5,
                  ),
                  const SizedBox(height: 24),

                  // Trip Details
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppColors.driverSurface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey[800]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Trip Details',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[100],
                            ),
                          ),
                          const SizedBox(height: 24),
                          _buildDetailRow(
                            Icons.location_on,
                            'Pickup',
                            widget.ride.pickupAddress,
                            AppColors.primary,
                          ),
                          const SizedBox(height: 16),
                          _buildDetailRow(
                            Icons.flag,
                            'Destination',
                            widget.ride.destinationAddress,
                            AppColors.success,
                          ),
                          const SizedBox(height: 16),
                          _buildDetailRow(
                            Icons.route,
                            'Distance',
                            '${_calculateDistance().toStringAsFixed(1)} km',
                            Colors.blue,
                          ),
                          const SizedBox(height: 16),
                          _buildDetailRow(
                            Icons.attach_money,
                            'Estimated Fare',
                            '${widget.ride.estimatedPrice?.toStringAsFixed(0) ?? '0'} CFA',
                            Colors.amber,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _rejectRide,
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            side: const BorderSide(
                              color: AppColors.error,
                              width: 2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text(
                            'Reject',
                            style: TextStyle(
                              color: AppColors.error,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _acceptRide,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            backgroundColor: AppColors.success,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: _isAccepting
                              ? const Center(
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  'Accept',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    IconData icon,
    String label,
    String value,
    Color color,
  ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontSize: 16,
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

  double _calculateDistance() {
    // Mock distance calculation
    return 5.2;
  }
}
