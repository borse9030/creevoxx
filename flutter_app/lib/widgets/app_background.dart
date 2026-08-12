import 'package:flutter/material.dart';

class AppBackground extends StatelessWidget {
  final Widget child;

  const AppBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Solid dark background — replaces the image
        const Positioned.fill(
          child: ColoredBox(color: Color(0xFF0F1A13)), // Dark olive/black theme color
        ),
        // The actual app content on top
        child,
      ],
    );
  }
}
