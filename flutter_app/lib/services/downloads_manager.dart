import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/resource.dart';

class DownloadsManager {
  static const String _key = 'downloads_list';

  static Future<List<Resource>> getDownloads() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? jsonString = prefs.getString(_key);
      if (jsonString == null) return [];
      
      final List<dynamic> jsonList = json.decode(jsonString);
      return jsonList.map((item) => Resource.fromJson(item)).toList();
    } catch (e) {
      print('Error in getDownloads: $e');
      return [];
    }
  }

  static Future<bool> isDownloaded(String id) async {
    final downloads = await getDownloads();
    return downloads.any((element) => element.id.toString() == id);
  }

  static Future<void> addDownload(Resource resource) async {
    final prefs = await SharedPreferences.getInstance();
    final downloads = await getDownloads();
    
    // Check if it already exists to avoid duplicates
    final index = downloads.indexWhere((element) => element.id.toString() == resource.id.toString());
    
    if (index < 0) {
      // Add to beginning of the list so newest are first
      downloads.insert(0, resource);
      
      // Limit to 50 items to prevent SharedPreferences bloating
      if (downloads.length > 50) {
        downloads.removeRange(50, downloads.length);
      }
      
      final String jsonString = json.encode(downloads.map((e) => e.toJson()).toList());
      await prefs.setString(_key, jsonString);
    }
  }
}
