import 'package:flutter/material.dart';

class AppColors {
  // Primary
  static const Color primary = Color(0xFF6686B2);
  static const Color primaryDark = Color(0xFF4A6FA5);

  // Neutral
  static const Color black = Color(0xFF000000);
  static const Color white = Color(0xFFFFFFFF);
  static const Color grey = Color(0xFF9E9E9E);
  static const Color lightGrey = Color(0xFFF5F5F5);

  // Driver Mode
  static const Color driverPrimary = Color(0xFF1A1A1A);
  static const Color driverSurface = Color(0xFF2A2A2A);
  static const Color driverAccent = Color(0xFF6686B2);

  // Error & Success
  static const Color error = Color(0xFFE74C3C);
  static const Color success = Color(0xFF2ECC71);

  // Gradients
  static const List<Color> primaryGradient = [
    Color(0xFF6686B2),
    Color(0xFF4A6FA5),
  ];

  static const List<Color> darkGradient = [
    Color(0xFF1A1A1A),
    Color(0xFF000000),
  ];

  // Shadows
  static const Color shadowLight = Color(0x1A000000);
  static const Color shadowMedium = Color(0x33000000);
}
