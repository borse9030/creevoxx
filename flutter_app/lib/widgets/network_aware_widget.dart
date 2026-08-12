import 'dart:async';
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Wraps any widget and shows a full-screen "No Internet" overlay when offline.
/// When connectivity is restored it automatically hides the overlay AND fires
/// [onReconnected] so the parent can re-fetch data.
class NetworkAwareWidget extends StatefulWidget {
  final Widget child;

  /// Called once each time the device transitions from offline → online.
  /// Use this to trigger data re-fetch in parent widgets.
  final VoidCallback? onReconnected;

  const NetworkAwareWidget({
    super.key,
    required this.child,
    this.onReconnected,
  });

  @override
  State<NetworkAwareWidget> createState() => _NetworkAwareWidgetState();
}

class _NetworkAwareWidgetState extends State<NetworkAwareWidget> {
  StreamSubscription<List<ConnectivityResult>>? _subscription;
  bool _hasConnection = true; // Optimistic: assume connected until proven otherwise
  bool _wasOffline = false;

  @override
  void initState() {
    super.initState();
    // Check current connectivity immediately on start
    _checkInitialConnectivity();
    // Listen to subsequent changes
    _subscription = Connectivity().onConnectivityChanged.listen(_onConnectivityChanged);
  }

  Future<void> _checkInitialConnectivity() async {
    final results = await Connectivity().checkConnectivity();
    if (!mounted) return;
    final isOffline = results.every((r) => r == ConnectivityResult.none);
    setState(() {
      _hasConnection = !isOffline;
      _wasOffline = isOffline;
    });
  }

  void _onConnectivityChanged(List<ConnectivityResult> results) {
    if (!mounted) return;
    final isOffline = results.every((r) => r == ConnectivityResult.none);

    if (_wasOffline && !isOffline) {
      // Just came back online
      setState(() {
        _hasConnection = true;
        _wasOffline = false;
      });
      // Notify parent to re-fetch data
      widget.onReconnected?.call();
    } else if (isOffline) {
      setState(() {
        _hasConnection = false;
        _wasOffline = true;
      });
    } else {
      // Online (wasn't offline before either)
      setState(() => _hasConnection = true);
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      textDirection: TextDirection.ltr,
      children: [
        widget.child,
        if (!_hasConnection)
          Positioned.fill(
            child: Directionality(
              textDirection: TextDirection.ltr,
              child: Container(
                color: const Color(0xFF163320),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.wifi_off_rounded,
                      size: 80,
                      color: Color(0xFF67D930),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'No Internet Connection',
                      style: TextStyle(
                        color: Color(0xFF67D930),
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.none,
                        fontFamily: 'Roboto',
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 40.0),
                      child: Text(
                        'Please turn on your internet connection to continue exploring mods, shaders, and textures.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color(0xFFF2F8F5),
                          fontSize: 16,
                          height: 1.5,
                          decoration: TextDecoration.none,
                          fontFamily: 'Roboto',
                          fontWeight: FontWeight.normal,
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                    ElevatedButton(
                      onPressed: () async {
                        // Manual retry: re-check connectivity right now
                        final results = await Connectivity().checkConnectivity();
                        if (!mounted) return;
                        final isOffline = results.every((r) => r == ConnectivityResult.none);
                        if (!isOffline) {
                          setState(() {
                            _hasConnection = true;
                            _wasOffline = false;
                          });
                          widget.onReconnected?.call();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF67D930),
                        foregroundColor: const Color(0xFF163320),
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                        elevation: 0,
                      ),
                      child: const Text(
                        'Retry',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
