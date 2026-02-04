import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/core/ride_repository.dart';
import 'package:taxi_track/features/ride/ride_bloc.dart' as bloc;
import 'package:taxi_track/features/ride/ride_bloc_impl.dart';
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
    _autoRejectTimer?.cancel();
    // The ride is already accepted in MockRideRepository, just navigate back
    Navigator.of(context).pop(true); // Return true to indicate acceptance
  }

  void _rejectRide() {
    _autoRejectTimer?.cancel();
    context.read<RideBlocImpl>().add(bloc.CancelRide(widget.ride.id!));
    Navigator.of(context).pop(false); // Return false to indicate rejection
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                        ? AppColors.error.withOpacity(0.2)
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
                  clientName: widget.ride.clientId ?? 'Client',
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
                          '\$${widget.ride.estimatedPrice?.toStringAsFixed(2) ?? '0.00'}',
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
                        child: const Text(
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
            color: color.withOpacity(0.2),
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
