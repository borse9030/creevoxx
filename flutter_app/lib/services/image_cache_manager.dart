import 'package:flutter_cache_manager/flutter_cache_manager.dart';

class AppImageCacheManager {
  static const key = 'customImageCache';

  static CacheManager instance = CacheManager(
    Config(
      key,
      stalePeriod: const Duration(days: 3), // Keep images for 3 days max (was 7)
      maxNrOfCacheObjects: 50, // Max 50 images to keep app size strictly < 100MB (was 200)
    ),
  );
}
