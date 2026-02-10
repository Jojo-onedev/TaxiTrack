import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:taxi_track/core/app_colors.dart';
import 'package:taxi_track/features/driver/driver_bloc.dart' as driver_bloc;
import 'package:taxi_track/features/driver/driver_bloc_impl.dart';
import 'package:intl/intl.dart';

class DriverEarningsTab extends StatefulWidget {
  const DriverEarningsTab({super.key});

  @override
  State<DriverEarningsTab> createState() => _DriverEarningsTabState();
}

class _DriverEarningsTabState extends State<DriverEarningsTab> {
  @override
  void initState() {
    super.initState();
    context.read<DriverBlocImpl>().add(driver_bloc.LoadDriverEarnings());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.driverPrimary,
      appBar: AppBar(
        title: const Text('Earnings'),
        backgroundColor: AppColors.driverPrimary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: BlocBuilder<DriverBlocImpl, driver_bloc.DriverState>(
        buildWhen: (prev, curr) => curr is driver_bloc.DriverEarningsLoaded,
        builder: (context, state) {
          if (state is driver_bloc.DriverEarningsLoaded) {
            double totalEarnings = 0;
            for (var item in state.earnings) {
              totalEarnings += (item['amount'] as num).toDouble();
            }

            return Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _buildTotalEarningsCard(totalEarnings),
                  const SizedBox(height: 24),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Last 30 Days',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: ListView.builder(
                      itemCount: state.earnings.length,
                      itemBuilder: (context, index) {
                        final item = state.earnings[index];
                        return _buildEarningsItem(item);
                      },
                    ),
                  ),
                ],
              ),
            );
          }
          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }

  Widget _buildTotalEarningsCard(double amount) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primary.withRed(100), // Slightly different shade
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'Total Earnings (30 Days)',
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 8),
          Text(
            '${amount.toStringAsFixed(0)} CFA',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEarningsItem(Map<String, dynamic> item) {
    final date = DateTime.parse(item['date']);
    final formattedDate = DateFormat('MMM d, y').format(date);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.driverSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[800]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                formattedDate,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${item['rides_count']} rides',
                style: TextStyle(color: Colors.grey[500], fontSize: 14),
              ),
            ],
          ),
          Text(
            '+ ${item['amount']} CFA',
            style: const TextStyle(
              color: AppColors.success,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
        ],
      ),
    );
  }
}
