import 'package:flutter/material.dart';

class AppColors {
  // Primary colors
  static const Color primary = Color(0xFF6686B2);
  static const Color background = Colors.white;
  static const Color surface = Colors.white;
  static const Color error = Color(0xFFB00020);

  // Neutral colors
  static const Color black = Color(0xFF000000);
  static const Color white = Color(0xFFFFFFFF);
  static const Color grey = Color(0xFF757575);
  static const Color lightGrey = Color(0xFFF5F5F5);
  static const Color darkGrey = Color(0xFF212121);

  // Client specific nuances
  static const Color clientPrimary = primary;
  static const Color clientBackground = white;

  // Driver specific nuances
  static const Color driverPrimary = primary;
  static const Color driverBackground = darkGrey;
  static const Color driverSurface = Color(0xFF333333);
}
