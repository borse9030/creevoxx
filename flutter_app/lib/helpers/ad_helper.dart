import 'dart:io';
import 'package:flutter/foundation.dart';

class AdHelper {
  static String get bannerAdUnitId {
    if (kDebugMode) {
      // Google's official Test Ad Unit ID for Banners
      return 'ca-app-pub-3940256099942544/6300978111';
    }

    if (Platform.isAndroid) {
      // NOTE: Replace with your actual Ad Unit ID before launching to Play Store!
      // You must create an Ad Unit in AdMob to get this ID.
      // E.g., 'ca-app-pub-6772455729424378/1234567890'
      return 'ca-app-pub-3940256099942544/6300978111'; // using test ID for now
    }
    // Fallback: return test ID instead of throwing — never crash on unsupported platform
    return 'ca-app-pub-3940256099942544/6300978111';
  }

  static String get interstitialAdUnitId {
    if (kDebugMode) {
      // Google's official Test Ad Unit ID for Interstitials
      return 'ca-app-pub-3940256099942544/1033173712';
    }

    if (Platform.isAndroid) {
      // NOTE: Replace with your actual Ad Unit ID before launching to Play Store!
      return 'ca-app-pub-3940256099942544/1033173712'; // using test ID for now
    }
    // Fallback: return test ID instead of throwing — never crash on unsupported platform
    return 'ca-app-pub-3940256099942544/1033173712';
  }
}
