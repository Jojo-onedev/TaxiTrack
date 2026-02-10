import 'package:flutter/material.dart';
import 'package:taxi_track/core/app_colors.dart';

class DriverInfoCard extends StatelessWidget {
  final String driverName;
  final double rating;
  final String carModel;
  final String carPlate;
  final String? photoUrl;
  final VoidCallback? onCall;
  final VoidCallback? onMessage;

  const DriverInfoCard({
    super.key,
    required this.driverName,
    required this.rating,
    required this.carModel,
    required this.carPlate,
    this.photoUrl,
    this.onCall,
    this.onMessage,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Driver Photo
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: AppColors.primaryGradient,
                  ),
                ),
                child: Center(
                  child: Text(
                    driverName[0].toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Driver Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      driverName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          rating.toStringAsFixed(1),
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Action Buttons
              Row(
                children: [
                  if (onCall != null)
                    _buildActionButton(
                      icon: Icons.phone,
                      color: AppColors.success,
                      onTap: onCall!,
                    ),
                  if (onMessage != null) ...[
                    const SizedBox(width: 8),
                    _buildActionButton(
                      icon: Icons.message,
                      color: AppColors.primary,
                      onTap: onMessage!,
                    ),
                  ],
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Car Info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.directions_car, color: Colors.grey[700]),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        carModel,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        carPlate,
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: color, size: 20),
      ),
    );
  }
}
