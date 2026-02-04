import 'package:flutter/material.dart';
import 'package:taxi_track/core/app_colors.dart';

class DriverHistoryScreen extends StatelessWidget {
  const DriverHistoryScreen({super.key});

  // Mock data
  final List<Map<String, dynamic>> _mockRides = const [
    {
      'id': '1',
      'date': '2026-02-04',
      'clientName': 'John Doe',
      'pickup': 'Times Square',
      'destination': 'JFK Airport',
      'fare': 45.50,
      'status': 'completed',
      'rating': 5.0,
    },
    {
      'id': '2',
      'date': '2026-02-04',
      'clientName': 'Sarah Smith',
      'pickup': 'Central Park',
      'destination': 'Brooklyn Bridge',
      'fare': 28.00,
      'status': 'completed',
      'rating': 4.5,
    },
    {
      'id': '3',
      'date': '2026-02-03',
      'clientName': 'Mike Johnson',
      'pickup': 'Grand Central',
      'destination': 'LaGuardia Airport',
      'fare': 38.75,
      'status': 'completed',
      'rating': 5.0,
    },
    {
      'id': '4',
      'date': '2026-02-03',
      'clientName': 'Emma Wilson',
      'pickup': 'Wall Street',
      'destination': 'Empire State Building',
      'fare': 22.50,
      'status': 'cancelled',
      'rating': null,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.driverPrimary,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Trip History',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[100],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${_mockRides.length} trips total',
                    style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                  ),
                ],
              ),
            ),

            // Rides List
            Expanded(
              child: _mockRides.isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      itemCount: _mockRides.length,
                      itemBuilder: (context, index) {
                        final ride = _mockRides[index];
                        return _buildRideCard(context, ride);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRideCard(BuildContext context, Map<String, dynamic> ride) {
    final isCompleted = ride['status'] == 'completed';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.driverSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[800]!),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showRideDetails(context, ride),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _formatDate(ride['date']),
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? AppColors.success.withOpacity(0.2)
                            : AppColors.error.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        isCompleted ? 'Completed' : 'Cancelled',
                        style: TextStyle(
                          fontSize: 11,
                          color: isCompleted
                              ? AppColors.success
                              : AppColors.error,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Route
                Row(
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Container(
                          width: 2,
                          height: 24,
                          color: Colors.grey[700],
                        ),
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            ride['pickup'],
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[100],
                            ),
                          ),
                          const SizedBox(height: 24),
                          Text(
                            ride['destination'],
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
                ),
                const SizedBox(height: 12),

                // Footer
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              colors: AppColors.primaryGradient,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              ride['clientName'][0],
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          ride['clientName'],
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[400],
                          ),
                        ),
                        if (ride['rating'] != null) ...[
                          const SizedBox(width: 8),
                          const Icon(Icons.star, color: Colors.amber, size: 14),
                          Text(
                            ' ${ride['rating']}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[400],
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      '\$${ride['fare'].toStringAsFixed(2)}',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[100],
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

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history, size: 80, color: Colors.grey[700]),
          const SizedBox(height: 16),
          Text(
            'No trips yet',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[400],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Your completed trips will appear here',
            style: TextStyle(fontSize: 14, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    final difference = now.difference(date).inDays;

    if (difference == 0) return 'Today';
    if (difference == 1) return 'Yesterday';
    if (difference < 7) return '$difference days ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  void _showRideDetails(BuildContext context, Map<String, dynamic> ride) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.driverSurface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: Colors.grey[800]!)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 50,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.grey[700],
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Trip Details',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.grey[100],
              ),
            ),
            const SizedBox(height: 24),
            _buildDetailRow('Date', _formatDate(ride['date'])),
            _buildDetailRow('Client', ride['clientName']),
            _buildDetailRow('Pickup', ride['pickup']),
            _buildDetailRow('Destination', ride['destination']),
            _buildDetailRow('Fare', '\$${ride['fare'].toStringAsFixed(2)}'),
            _buildDetailRow(
              'Status',
              ride['status'] == 'completed' ? 'Completed' : 'Cancelled',
            ),
            if (ride['rating'] != null)
              _buildDetailRow('Rating', '${ride['rating']} ⭐'),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 14, color: Colors.grey[500])),
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
    );
  }
}
