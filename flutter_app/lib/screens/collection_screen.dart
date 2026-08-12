import 'package:flutter/material.dart';
import '../models/resource.dart';
import '../services/api_service.dart';
import '../widgets/resource_card.dart';
import '../widgets/app_error_widget.dart';
import '../widgets/banner_ad_widget.dart';

import '../widgets/skeleton_cards.dart';

class CollectionScreen extends StatelessWidget {
  final bool isBottomTab;
  const CollectionScreen({super.key, this.isBottomTab = false});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 5,
      child: Scaffold(
        backgroundColor: const Color(0xFF163320),
        appBar: AppBar(
          backgroundColor: const Color(0xFF163320),
          toolbarHeight: 45, // Make top bar smaller/more compact
          automaticallyImplyLeading: !isBottomTab,
          title: const Text('Collections', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          iconTheme: const IconThemeData(color: Colors.white),
          bottom: const TabBar(
            isScrollable: true,
            labelColor: Color(0xFF67D930),
            unselectedLabelColor: Colors.white54,
            indicatorColor: Color(0xFF67D930),
            tabs: [
              Tab(text: 'Render Dragon'),
              Tab(text: 'Vibrant Visual'),
              Tab(text: 'RTX'),
              Tab(text: 'High End'),
              Tab(text: 'Low End'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _CollectionTab(query: 'render dragon'),
            _CollectionTab(query: 'vibrant'),
            _CollectionTab(query: 'rtx'),
            _CollectionTab(query: 'high end'),
            _CollectionTab(query: 'low end'),
          ],
        ),
      ),
    );
  }
}

class _CollectionTab extends StatefulWidget {
  final String query;
  const _CollectionTab({required this.query});

  @override
  State<_CollectionTab> createState() => _CollectionTabState();
}

class _CollectionTabState extends State<_CollectionTab> {
  bool _isLoading = true;
  bool _isFetchingMore = false;
  bool _hasError = false;
  bool _hasMore = true;
  int _page = 1;
  List<Resource> _resources = [];
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _fetchCuratedResources();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    // Background pre-fetching: When user scrolls near the bottom, silently fetch next page.
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 500) {
      if (!_isFetchingMore && _hasMore && !_isLoading) {
        _fetchCuratedResources(pageToLoad: _page + 1);
      }
    }
  }

  Future<void> _fetchCuratedResources({int pageToLoad = 1}) async {
    if (!mounted) return;
    
    setState(() {
      if (pageToLoad == 1) {
        _isLoading = true;
      } else {
        _isFetchingMore = true;
      }
      _page = pageToLoad;
    });

    try {
      final result = await ApiService.searchResources(
        category: 'shaders',
        query: widget.query,
        page: _page,
        // Show cached results instantly — no spinner when switching tabs
        onCachedData: (cachedData) {
          if (mounted && pageToLoad == 1) {
            setState(() {
              _resources = cachedData['resources'] as List<Resource>;
              _isLoading = false;
              _isFetchingMore = false;
            });
          }
        },
      );
      if (mounted && result.containsKey('resources') && result['resources'] != null) {
        setState(() {
          final newResources = result['resources'] as List<Resource>;
          if (pageToLoad == 1) {
            _resources = newResources;
          } else {
            _resources.addAll(newResources);
          }
          
          _hasMore = newResources.length >= 10;
          _isLoading = false;
          _isFetchingMore = false;
        });
      } else if (mounted) {
        setState(() {
          _isLoading = false;
          _isFetchingMore = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() {
        _isLoading = false;
        _isFetchingMore = false;
        _hasError = _resources.isEmpty;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      // Shimmer Skeletons for perceived performance
      return ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: 4,
        itemBuilder: (context, index) {
          return const Padding(
            padding: EdgeInsets.only(bottom: 24.0),
            child: SkeletonResourceCard(),
          );
        },
      );
    }
    
    if (_hasError && _resources.isEmpty) {
      return AppErrorWidget(
        message: 'Could not load shaders.',
        onRetry: () {
          setState(() { _hasError = false; });
          _fetchCuratedResources();
        },
      );
    }
    
    if (_resources.isEmpty) {
      return Center(child: Text('No shaders found for "${widget.query}".', style: const TextStyle(color: Colors.white54)));
    }
    
    return ListView.builder(
      controller: _scrollController,
      cacheExtent: 1500, // Preload cards off-screen for stutter-free fast scrolling
      padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0, bottom: 100.0),
      itemCount: _resources.length + 1, // +1 for loading indicator at bottom
      itemBuilder: (context, index) {
        if (index == _resources.length) {
          if (_isFetchingMore) {
            return const Padding(
              padding: EdgeInsets.symmetric(vertical: 24.0),
              child: Center(child: CircularProgressIndicator(color: Color(0xFF67D930))),
            );
          } else {
            return const SizedBox.shrink();
          }
        }
        
        final card = Padding(
          padding: const EdgeInsets.only(bottom: 24.0),
          child: ResourceCardWidget(
            resource: _resources[index],
          ),
        );

        // Show an inline banner ad every 5 cards
        if (index > 0 && (index + 1) % 5 == 0) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              card,
              const RepaintBoundary( // Isolates the heavy WebView ad from scrolling repaints
                child: BannerAdWidget(),
              ),
              const SizedBox(height: 24),
            ],
          );
        }

        return card;
      },
    );
  }
}
