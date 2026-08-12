import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'screens/home_screen.dart';
import 'services/cache_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize sequentially. Doing this in parallel via Future.wait can cause 
  // race conditions in the Flutter engine's platform channels on Android Release builds (AOT),
  // leading to an instant fatal crash on startup.
  await CacheService.database;
  // We DO NOT await MobileAds here because it blocks the UI thread for 2-5 seconds
  // on startup, causing a long blank screen. We let it initialize in the background!
  MobileAds.instance.initialize();
  // google_fonts REMOVED permanently:
  // allowRuntimeFetching=true makes HTTP requests on first launch that block
  // the main thread for 2,718–5,103ms (confirmed in DevTools Logging tab).
  // Flutter's built-in Roboto is visually identical and has zero network cost.
  runApp(const CreevoxxApp());
}

class CreevoxxApp extends StatelessWidget {
  const CreevoxxApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MCPE Shaders and Textures',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF163320), // Olive background
        primaryColor: const Color(0xFF67D930), // Neon accent
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF67D930),
          secondary: Color(0xFF67D930),
          surface: Color(0xFF2A5030), // Olive surface
        ),
        // System Roboto font — always bundled with Flutter, zero network cost.
        // google_fonts was blocking the main thread for 2,718–5,103ms causing
        // cascading TimerSignificantlyOverdue warnings across the whole app.
        textTheme: ThemeData.dark().textTheme.copyWith(
          bodyLarge: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          bodyMedium: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          bodySmall: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          titleLarge: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          titleMedium: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          titleSmall: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          displayLarge: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          displayMedium: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          displaySmall: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          headlineLarge: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          headlineMedium: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
          headlineSmall: const TextStyle(color: Color(0xFFF2F8F5), fontFamily: 'Roboto'),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF163320),
          elevation: 0,
        ),
      ),
      home: const HomeScreen(),
      builder: (context, child) => child!,
      debugShowCheckedModeBanner: false,
    );
  }
}
