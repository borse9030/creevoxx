# ============================================================
# Flutter — keep all generated plugin registrant code
# ============================================================
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.plugin.** { *; }
-dontwarn io.flutter.**

# ============================================================
# sqflite — SQLite database (used by CacheService)
# R8 strips SqflitePlugin and its native bridge without this
# ============================================================
-keep class com.tekartik.sqflite.** { *; }
-dontwarn com.tekartik.sqflite.**

# ============================================================
# google_mobile_ads — AdMob
# Reflection-heavy; stripping causes instant crash on startup
# ============================================================
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
-keep class com.google.android.gms.common.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.ads.**

# ============================================================
# connectivity_plus — network detection
# ============================================================
-keep class dev.fluttercommunity.plus.connectivity.** { *; }
-dontwarn dev.fluttercommunity.plus.connectivity.**

# ============================================================
# shared_preferences — used by FavoritesManager / DownloadsManager
# ============================================================
-keep class io.flutter.plugins.sharedpreferences.** { *; }
-dontwarn io.flutter.plugins.sharedpreferences.**

# ============================================================
# path_provider — used for temp download directory
# ============================================================
-keep class io.flutter.plugins.pathprovider.** { *; }
-dontwarn io.flutter.plugins.pathprovider.**

# ============================================================
# open_filex — open downloaded .mcpack/.mcworld files
# ============================================================
-keep class com.crazecoder.openfile.** { *; }
-dontwarn com.crazecoder.openfile.**

# ============================================================
# url_launcher — opens CurseForge links, mailto, market://
# ============================================================
-keep class io.flutter.plugins.urllauncher.** { *; }
-dontwarn io.flutter.plugins.urllauncher.**

# ============================================================
# share_plus — share files/links
# ============================================================
-keep class dev.fluttercommunity.plus.share.** { *; }
-dontwarn dev.fluttercommunity.plus.share.**

# ============================================================
# flutter_cache_manager — image disk caching
# ============================================================
-keep class com.ryanheise.** { *; }
-dontwarn com.ryanheise.**

# ============================================================
# Kotlin & coroutines (used internally by many plugins)
# ============================================================
-keep class kotlin.** { *; }
-keep class kotlinx.coroutines.** { *; }
-dontwarn kotlin.**
-dontwarn kotlinx.**

# ============================================================
# AndroidX — required by almost every modern plugin
# ============================================================
-keep class androidx.** { *; }
-dontwarn androidx.**

# ============================================================
# Prevent stripping of enums (Dart<->Java bridge uses them)
# ============================================================
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
