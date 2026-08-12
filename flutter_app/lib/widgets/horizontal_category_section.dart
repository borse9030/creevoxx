import 'package:flutter/material.dart';
import '../models/resource.dart';
import '../services/api_service.dart';
import 'horizontal_resource_card.dart';
import 'skeleton_cards.dart';

class HorizontalCategorySection extends StatefulWidget {
  final String title;
  final String query;
  final String category;
  final VoidCallback? onSeeAll;

  const HorizontalCategorySection({
    super.key,
    required this.title,
    required this.query,
    this.category = 'shaders',
    this.onSeeAll,
  });

  @override
  State<HorizontalCategorySection> createState() => _HorizontalCategorySectionState();
}

class _HorizontalCategorySectionState extends State<HorizontalCategorySection> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  List<Resource> _resources = [];
  bool _isLoading = true;
  late final PageController _pageController;
  // Track page as int — updated only on discrete page changes, not every scroll pixel
  int _centerPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.78); // Smaller fraction to bring cards closer for peeking
    _fetchData();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant HorizontalCategorySection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.query != widget.query || oldWidget.category != widget.category) {
      _fetchData();
    }
  }

  // Static counter removed — staggering caused up to 2s of artificial delay.
  // Cache is pre-warmed at startup, so cached sections load instantly.
  // Uncached sections fire network requests without delay and show skeletons.

  Future<void> _fetchData() async {
    if (!mounted) return;

    try {
      final result = await ApiService.searchResources(
        query: widget.query,
        category: widget.category,
        page: 1,
        // Do NOT skipNetworkIfCached — always refresh from network after serving
        // cache. This prevents stale cached results from blocking fresh data.
        onCachedData: (cachedData) {
          // Serve cached data immediately for instant display
          if (mounted) {
            final fetched = cachedData['resources'] as List<Resource>;
            fetched.shuffle();
            setState(() {
              _resources = fetched;
              _isLoading = false;
            });
          }
        },
      );

      // Always update from network result (cache-then-network pattern).
      // Guard null: api_service returns {} on network failure after serving cache.
      if (mounted && result.containsKey('resources') && result['resources'] != null) {
        final fetched = result['resources'] as List<Resource>;
        fetched.shuffle();
        setState(() {
          _resources = fetched;
          _isLoading = false;
        });
      } else if (mounted) {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }



  @override
  Widget build(BuildContext context) {
    super.build(context); // Required by AutomaticKeepAliveClientMixin

    if (_isLoading) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    widget.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: widget.onSeeAll,
                  child: const Text(
                    'See all',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 360,
            child: PageView.builder(
              clipBehavior: Clip.none,
              controller: _pageController,
              itemCount: 3, // Show a few skeletons
              itemBuilder: (context, index) {
                final bool isCenter = index == _centerPage;
                return Center(
                  child: AnimatedScale(
                    scale: isCenter ? 1.10 : 0.85,
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeOut,
                    child: const SkeletonHorizontalCard(),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
        ],
      );
    }

    if (_resources.isEmpty) {
      return const SizedBox.shrink(); // Don't show anything if no results
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  widget.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              TextButton(
                onPressed: widget.onSeeAll,
                child: const Text(
                  'See all',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 360, // Increased to fit the scaled up center card
          child: PageView.builder(
            clipBehavior: Clip.none,
            controller: _pageController,
            onPageChanged: (page) => setState(() => _centerPage = page),
            itemCount: _resources.length,
            itemBuilder: (context, index) {
              final bool isCenter = index == _centerPage;
              return Center(
                child: AnimatedScale(
                  scale: isCenter ? 1.10 : 0.85, // Scale up center to make it big, scale down sides to make them smaller
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOut,
                  child: HorizontalResourceCard(resource: _resources[index]),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}
