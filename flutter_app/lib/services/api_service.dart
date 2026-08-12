import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/resource.dart';
import '../models/resource_details.dart';
import 'cache_service.dart';

class ApiService {
  // API base URL — public endpoint, safe to hardcode.
  static const String baseUrl = 'https://www.creevoxx.dev/api';

  // Shared secret compiled into the binary (not a plain-text .env asset).
  // This prevents trivial extraction by unzipping the APK.
  static const Map<String, String> headers = {
    'x-app-secret': 'f1ac035355ad02ce3f1714d2137627975ed94dd76bea068d01ead49b8895cd11',
  };

  static Future<List<Resource?>> getTopPicks() async {
    const String cacheKey = 'top_picks_v4';
    
    // 1. Try cache first
    final cachedData = await CacheService.getCache(cacheKey);
    if (cachedData != null) {
      final List rawList = cachedData['resources'] as List;
      return rawList
          .map((item) => item != null ? Resource.fromJson(item) : null)
          .toList();
    }

    // 2. Fetch from dedicated API route
    final Uri url = Uri.parse('$baseUrl/top-picks?v=4');
    try {
      final response = await http.get(url, headers: headers).timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        // Server preserves positional mapping; some slots may be null
        final List rawList = decoded['resources'] as List;
        final List<Resource?> resources = rawList
            .map((item) => item != null ? Resource.fromJson(item) : null)
            .toList();
        
        await CacheService.saveCache(cacheKey, decoded);
        return resources;
      }
    } catch (e) {
      debugPrint('Error fetching Top Picks: $e');
    }
    return [];
  }


  static Future<Map<String, dynamic>> searchResources({
    String query = '',
    String category = 'all',
    int page = 1,
    int? categoryId, // Real CurseForge subcategory ID for proper tag filtering
    String sortField = '6', // 6=TotalDownloads, 3=LastUpdated, 2=Popularity
    Function(Map<String, dynamic>)? onCachedData,
    bool skipNetworkIfCached = false,
  }) async {
    final int index = (page - 1) * 6;
    final String cacheKey = 'search_v2_${category}_${query}_cid${categoryId ?? 'none'}_${page}_$sortField';
    
    // 1. Try to load from cache first
    bool hasCachedData = false;
    if (onCachedData != null) {
      final cachedData = await CacheService.getCache(cacheKey);
      if (cachedData != null) {
        hasCachedData = true;
        final List<Resource> resources = (cachedData['data'] as List)
            .map((item) => Resource.fromJson(item))
            .toList();
        final int totalCount = cachedData['pagination']?['totalCount'] ?? 
                               cachedData['meta']?['total_count'] ?? 0;
        final counts = cachedData['counts'] ?? {};
        
        onCachedData({
          'resources': resources,
          'totalCount': totalCount,
          'counts': counts,
        });
        
        if (skipNetworkIfCached) {
          return {
            'resources': resources,
            'totalCount': totalCount,
            'counts': counts,
          };
        }
      }
    }

    final Uri url = Uri.parse('$baseUrl/search').replace(queryParameters: {
      if (query.isNotEmpty) 'q': query,
      'category': category,
      'index': index.toString(),
      'pageSize': '20',
      'edition': 'bedrock',
      'sortField': sortField,
      if (categoryId != null) 'categoryId': categoryId.toString(),
    });

    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // Fire-and-forget: don't await the DB write — it must not block the response
        unawaited(CacheService.saveCache(cacheKey, data));
        
        final List<Resource> resources = (data['data'] as List)
            .map((item) => Resource.fromJson(item))
            .toList();
        final int totalCount = data['pagination']?['totalCount'] ?? 
                               data['meta']?['total_count'] ?? 0;
        final counts = data['counts'] ?? {};
        
        return {
          'resources': resources,
          'totalCount': totalCount,
          'counts': counts,
        };
      } else {
        throw Exception('Failed to load resources: ${response.statusCode}');
      }
    } catch (e) {
      // If we already served cached data, silently ignore network failures.
      // The UI already has content so no need to throw an error.
      if (hasCachedData) return {};
      print('ApiService search error: $e');
      rethrow;
    }
  }

  static Future<ResourceDetails> getResourceDetails(String id, {Function(ResourceDetails)? onCachedData}) async {
    final String cacheKey = 'details_$id';
    
    // 1. Try to load from cache first
    bool hasCachedData = false;
    if (onCachedData != null) {
      // FIX 5: Use 24-hour TTL for mod detail pages
      final cachedData = await CacheService.getCache(cacheKey, isDetailCache: true);

      if (cachedData != null) {
        hasCachedData = true;
        onCachedData(ResourceDetails.fromJson(cachedData));
      }
    }


    final Uri url = Uri.parse('$baseUrl/resource/$id');
    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        // Fire-and-forget: don't await the DB write
        unawaited(CacheService.saveCache(cacheKey, data));
        
        return ResourceDetails.fromJson(data);
      } else {
        throw Exception('Failed to load resource details: ${response.statusCode}');
      }
    } catch (e) {
      // If we already served cached data, silently ignore network failures.
      if (hasCachedData) throw Exception('Offline - using cache');
      print('ApiService details error: $e');
      rethrow;
    }
  }
}
