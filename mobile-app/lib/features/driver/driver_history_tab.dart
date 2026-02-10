import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/features/driver/driver_bloc.dart' as driver_bloc;
import 'package:taxi_track/features/driver/driver_bloc_impl.dart';
import 'package:intl/intl.dart';

class DriverHistoryTab extends StatefulWidget {
  const DriverHistoryTab({super.key});

  @override
  State<DriverHistoryTab> createState() => _DriverHistoryTabState();
}

class _DriverHistoryTabState extends State<DriverHistoryTab> {
  @override
  void initState() {
    super.initState();
    context.read<DriverBlocImpl>().add(const driver_bloc.LoadDriverHistory());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.driverPrimary,
      appBar: AppBar(
        title: const Text('Ride History'),
        backgroundColor: AppColors.driverPrimary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<DriverBlocImpl>().add(
                const driver_bloc.LoadDriverHistory(),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<DriverBlocImpl, driver_bloc.DriverState>(
        buildWhen: (prev, curr) => curr is driver_bloc.DriverHistoryLoaded,
        builder: (context, state) {
          if (state is driver_bloc.DriverHistoryLoaded) {
            if (state.rides.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.history, size: 64, color: Colors.grey[800]),
                    const SizedBox(height: 16),
                    Text(
                      'No rides yet',
                      style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: state.rides.length,
              itemBuilder: (context, index) {
                final ride = state.rides[index];
                return _buildHistoryItem(ride);
              },
            );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }

  Widget _buildHistoryItem(Map<String, dynamic> ride) {
    final date = DateTime.parse(ride['date']);
    final formattedDate = DateFormat('MMM d, y • HH:mm').format(date);
    final isCompleted = ride['status'] == 'completed';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.driverSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[800]!),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                formattedDate,
                style: TextStyle(color: Colors.grey[500], fontSize: 12),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: (isCompleted ? AppColors.success : AppColors.error)
                      .withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  ride['status'].toString().toUpperCase(),
                  style: TextStyle(
                    color: isCompleted ? AppColors.success : AppColors.error,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLocationRow(
                      Icons.trip_origin,
                      ride['pickup'],
                      AppColors.primary,
                    ),
                    const SizedBox(height: 8),
                    _buildLocationRow(
                      Icons.location_on,
                      ride['destination'],
                      AppColors.success,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Text(
                '${ride['price']} CFA',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocationRow(IconData icon, String text, Color color) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
