import 'package:flutter/material.dart';

/// A friendly error widget shown when API calls fail.
/// Shows different messages based on the error type (network vs server).
class AppErrorWidget extends StatelessWidget {
  final String? message;
  final VoidCallback? onRetry;
  final bool isCompact;

  const AppErrorWidget({
    super.key,
    this.message,
    this.onRetry,
    this.isCompact = false,
  });

  bool _isNetworkError(String? msg) {
    if (msg == null) return false;
    final lower = msg.toLowerCase();
    return lower.contains('socket') ||
        lower.contains('connection') ||
        lower.contains('network') ||
        lower.contains('timeout') ||
        lower.contains('host lookup');
  }

  @override
  Widget build(BuildContext context) {
    final isNetwork = _isNetworkError(message);

    final icon = isNetwork ? Icons.wifi_off_rounded : Icons.cloud_off_rounded;
    final title = isNetwork ? 'No Internet Connection' : 'Something Went Wrong';
    final subtitle = isNetwork
        ? 'Check your connection and try again.'
        : 'We couldn\'t load the content. Please try again shortly.';

    if (isCompact) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white24, size: 36),
            const SizedBox(height: 8),
            Text(subtitle,
                style: const TextStyle(color: Colors.white54, fontSize: 13),
                textAlign: TextAlign.center),
            if (onRetry != null) ...[
              const SizedBox(height: 10),
              _retryButton(),
            ],
          ],
        ),
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1E4A2A),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: const Color(0xFF67D930), size: 48),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: const TextStyle(color: Colors.white54, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              _retryButton(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _retryButton() {
    return ElevatedButton.icon(
      onPressed: onRetry,
      icon: const Icon(Icons.refresh_rounded, size: 18),
      label: const Text('Try Again'),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF67D930),
        foregroundColor: Colors.black,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        textStyle: const TextStyle(fontWeight: FontWeight.bold),
      ),
    );
  }
}
