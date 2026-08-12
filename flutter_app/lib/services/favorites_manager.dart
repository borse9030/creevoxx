import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/resource.dart';

class FavoritesManager {
  static const String _key = 'favorites_list';

  static Future<List<Resource>> getFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? jsonString = prefs.getString(_key);
      if (jsonString == null) return [];
      
      final List<dynamic> jsonList = json.decode(jsonString);
      return jsonList.map((item) => Resource.fromJson(item)).toList();
    } catch (e) {
      print('Error in getFavorites: $e');
      return [];
    }
  }

  static Future<bool> isFavorite(String id) async {
    final favorites = await getFavorites();
    return favorites.any((element) => element.id.toString() == id);
  }

  static Future<void> toggleFavorite(Resource resource) async {
    final prefs = await SharedPreferences.getInstance();
    final favorites = await getFavorites();
    
    final index = favorites.indexWhere((element) => element.id.toString() == resource.id.toString());
    
    if (index >= 0) {
      favorites.removeAt(index);
    } else {
      favorites.add(resource);
    }
    
    // Limit to 50 items to prevent SharedPreferences bloating
    if (favorites.length > 50) {
      favorites.removeRange(50, favorites.length);
    }
    
    final String jsonString = json.encode(favorites.map((e) => e.toJson()).toList());
    await prefs.setString(_key, jsonString);
  }
}
