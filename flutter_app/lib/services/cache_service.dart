import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class CacheService {
  static Database? _database;

  // FIX 5: Differentiated TTLs to reduce redundant backend calls.
  // Search results: 2 hours — users expect reasonably fresh content
  // Detail pages: 24 hours — mod details almost never change within a day
  static const int _searchTtlMinutes = 120;  // 2 hours
  static const int _detailTtlMinutes = 1440; // 24 hours

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB();
    return _database!;
  }

  static Future<Database> _initDB() async {
    String dbPath = await getDatabasesPath();
    String path = join(dbPath, 'api_cache.db');

    final db = await openDatabase(
      path,
      version: 2,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE cache(
            cache_key TEXT PRIMARY KEY,
            json_data TEXT,
            timestamp INTEGER
          )
        ''');
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        // Drop and recreate cache table on version bump to clear all stale entries
        await db.execute('DROP TABLE IF EXISTS cache');
        await db.execute('''
          CREATE TABLE cache(
            cache_key TEXT PRIMARY KEY,
            json_data TEXT,
            timestamp INTEGER
          )
        ''');
      },
    );

    // Auto-cleanup on startup to prevent unbounded database growth
    await _cleanupCache(db);
    return db;
  }

  static Future<void> _cleanupCache(Database db) async {
    try {
      // 1. Delete anything older than 24 hours (1440 minutes - max TTL used for detail pages)
      final cutoff = DateTime.now().subtract(const Duration(minutes: _detailTtlMinutes)).millisecondsSinceEpoch;
      await db.delete('cache', where: 'timestamp < ?', whereArgs: [cutoff]);

      // 2. Hard cap at 100 entries to prevent DB bloat over months of usage
      final count = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM cache')) ?? 0;
      if (count > 100) {
        // Delete oldest entries to bring the count back down to 50
        await db.execute('''
          DELETE FROM cache 
          WHERE cache_key IN (
            SELECT cache_key FROM cache 
            ORDER BY timestamp ASC 
            LIMIT ?
          )
        ''', [count - 50]);
      }
    } catch (e) {
      // Ignore cleanup errors so app doesn't crash on startup
    }
  }

  static Future<void> saveCache(String key, Map<String, dynamic> data) async {
    final db = await database;
    await db.insert(
      'cache',
      {
        'cache_key': key,
        'json_data': json.encode(data),
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Retrieves a cached entry if it hasn't expired.
  /// [isDetailCache] — use longer TTL for mod detail pages.
  static Future<Map<String, dynamic>?> getCache(String key, {bool isDetailCache = false}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'cache',
      where: 'cache_key = ?',
      whereArgs: [key],
    );

    if (maps.isNotEmpty) {
      final int timestamp = maps.first['timestamp'] as int;
      final DateTime cachedTime = DateTime.fromMillisecondsSinceEpoch(timestamp);
      final int ttlMinutes = isDetailCache ? _detailTtlMinutes : _searchTtlMinutes;

      if (DateTime.now().difference(cachedTime).inMinutes > ttlMinutes) {
        return null; // Cache is stale
      }

      return json.decode(maps.first['json_data'] as String);
    }
    return null;
  }
}
