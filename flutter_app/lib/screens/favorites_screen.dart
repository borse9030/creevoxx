import 'package:flutter/material.dart';
import '../models/resource.dart';
import '../services/favorites_manager.dart';
import '../widgets/resource_card.dart';
import '../widgets/banner_ad_widget.dart';

class FavoritesScreen extends StatefulWidget {
  final bool isBottomTab;
  const FavoritesScreen({super.key, this.isBottomTab = false});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  List<Resource> _favorites = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    final favorites = await FavoritesManager.getFavorites();
    setState(() {
      _favorites = favorites;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF163320),
      appBar: AppBar(
        backgroundColor: const Color(0xFF163320),
        elevation: 0,
        automaticallyImplyLeading: !widget.isBottomTab,
        title: const Text('My Favorites', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        leading: widget.isBottomTab
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF67D930)))
          : _favorites.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  cacheExtent: 1500,
                  itemCount: _favorites.length + 1, // +1 for the guaranteed ad at the bottom
                  itemBuilder: (context, index) {
                    // Always show the ad as the very last item in the list
                    if (index == _favorites.length) {
                      return const Padding(
                        padding: EdgeInsets.only(bottom: 24.0),
                        child: RepaintBoundary(
                          child: BannerAdWidget(),
                        ),
                      );
                    }

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 24.0),
                      child: ResourceCardWidget(resource: _favorites[index]),
                    );
                  },
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.favorite_border, size: 64, color: Colors.white.withOpacity(0.2)),
          const SizedBox(height: 16),
          const Text(
            'No favorites yet',
            style: TextStyle(
              color: Colors.white54,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
