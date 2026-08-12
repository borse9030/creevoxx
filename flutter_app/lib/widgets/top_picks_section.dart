import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/resource.dart';
import '../services/api_service.dart';
import '../services/image_cache_manager.dart';
import '../screens/detail_screen.dart';

/// Curated Top Picks — first horizontal grid on the home screen.
/// Cards are identical in size/hover/border to HorizontalCategorySection cards.
/// The center card auto-advances every 3 seconds.
class TopPicksSection extends StatefulWidget {
  const TopPicksSection({super.key});

  @override
  State<TopPicksSection> createState() => _TopPicksSectionState();
}

class _TopPicksSectionState extends State<TopPicksSection> {

  // Each entry: 'name' shown in the card title area (display only),
  // 'query' is what gets sent to the CurseForge search API.
  // Using shorter distinctive queries avoids mismatches from typos or colons.
  static const List<Map<String, String>> _picks = [
    {'name': 'NEWB X DAWN',       'query': 'Newb X Dawn'},
    {'name': 'NEWB X STARS',      'query': 'Newb X Stars'},
    {'name': 'NEWB X UNWIND',     'query': 'Newb X Unwind'},
    {'name': 'NEWB X FLAMINGO',   'query': 'Newb X Flamingo'},
    {'name': 'NEWB X SAPPHIRE',   'query': 'Newb X Sapphire'},
    {'name': 'NEWB X LEGACY',     'query': 'Newb X Legacy'},
    {'name': 'NEWB X DRAGON',     'query': 'Newb X Dragon'},
    {'name': 'NEWB X ALE',        'query': 'Newb X Ale'},
    {'name': 'NEWB X APOCALIPSIS','query': 'Newb X Apocalipsis'},
  ];

  List<Resource?> _resources = List.filled(_picks.length, null);
  bool _isLoading = true;
  bool _hasError = false;
  late final PageController _pageController;

  // Infinite loop: virtual page count is huge. Real card index = _virtualPage % _picks.length.
  // This lets animateToPage always go forward — no jumpToPage snap ever.
  static const int _virtualMid = 5000; // Start near middle of virtual range
  int _virtualPage = _virtualMid;
  Timer? _autoScrollTimer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(
      viewportFraction: 0.78,
      initialPage: _virtualMid,
    );
    _fetchTopPicks();
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _fetchTopPicks() async {
    if (!mounted) return;

    if (mounted) {
      setState(() {
        _isLoading = true;
        _hasError = false;
      });
    }

    try {
      // Returns List<Resource?> — null slots mean that pick had no CurseForge match.
      final resources = await ApiService.getTopPicks();
      if (mounted) {
        // Check if at least one slot has a real resource
        final hasAnyResource = resources.any((r) => r != null);
        if (!hasAnyResource) {
          // Everything is null or empty — show retry UI
          setState(() {
            _isLoading = false;
            _hasError = true;
          });
        } else {
          setState(() {
            // Start with all nulls, then fill from API response (positional mapping)
            _resources = List<Resource?>.filled(_picks.length, null);
            for (int i = 0; i < resources.length && i < _picks.length; i++) {
              _resources[i] = resources[i]; // null slots stay null → _PlaceholderCard
            }
            _isLoading = false;
            _hasError = false;
          });
          _startAutoScroll();
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasError = true;
        });
      }
    }
  }

  void _startAutoScroll() {
    _autoScrollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (!mounted || !_pageController.hasClients) return;
      // Always animate forward — infinite virtual list means no snap-back ever
      _pageController.animateToPage(
        _virtualPage + 1,
        duration: const Duration(milliseconds: 600),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  Widget build(BuildContext context) {

    // ── Error / retry state ──────────────────────────────────────────────
    if (_hasError) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
        child: Container(
          height: 120,
          decoration: BoxDecoration(
            color: const Color(0xFF1D4724),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: const Color(0xFF254A30),
              width: 1.5,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.wifi_off_rounded,
                  color: Color(0xFF67D930), size: 28),
              const SizedBox(height: 8),
              const Text(
                'Could not load Top Picks',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 10),
              GestureDetector(
                onTap: _fetchTopPicks,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20, vertical: 7),
                  decoration: BoxDecoration(
                    color: const Color(0xFF67D930),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Retry',
                    style: TextStyle(
                      color: Color(0xFF163320),
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header — TOP PICKS badge only
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFF67D930).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: const Color(0xFF67D930).withValues(alpha: 0.45),
                width: 1,
              ),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.star_rounded, color: Color(0xFF67D930), size: 12),
                SizedBox(width: 3),
                Text(
                  'TOP PICKS',
                  style: TextStyle(
                    color: Color(0xFF67D930),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 12),
        SizedBox(
          height: 360,
          child: PageView.builder(
            clipBehavior: Clip.none,
            controller: _pageController,
            onPageChanged: (page) => setState(() => _virtualPage = page),
            // Large virtual count = effectively infinite loop in both directions.
            // MUST be the same even when loading, otherwise initialPage=5000 > itemCount=3 crashes the app!
            itemCount: _picks.length * 10000,
            itemBuilder: (context, virtualIndex) {
              final bool isCenter = virtualIndex == _virtualPage;
              // Map virtual index to real card index
              final int realIndex = virtualIndex % _picks.length;
              return Center(
                child: AnimatedScale(
                  scale: isCenter ? 1.10 : 0.85,
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOut,
                  child: _isLoading
                      ? _SkeletonCard()
                      : (_resources[realIndex] == null
                          ? _PlaceholderCard(name: _picks[realIndex]['name']!)
                          : _TopPickCard(resource: _resources[realIndex]!)),
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


// ── Skeleton — mirrors exact card structure so it's the same size ─────────
class _SkeletonCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(left: 8, right: 8, bottom: 20, top: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF1D4724),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF254A30), width: 1.5),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Image placeholder — same AspectRatio as real card
          AspectRatio(
            aspectRatio: 16 / 10,
            child: Container(color: const Color(0xFF1E3D28)),
          ),
          // Text placeholder rows
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 14,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A5030),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 11,
                  width: 120,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A5030),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  height: 10,
                  width: 80,
                  decoration: BoxDecoration(
                    color: const Color(0xFF254A30),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Placeholder when API returns no result for this specific pick ──────────
class _PlaceholderCard extends StatelessWidget {
  final String name;
  const _PlaceholderCard({required this.name});

  @override
  Widget build(BuildContext context) {
    // Show a minimal card with the pick name so the carousel still looks full
    return Container(
      margin: const EdgeInsets.only(left: 8, right: 8, bottom: 20, top: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF1D4724),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF254A30), width: 1.5),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Grey image placeholder
          AspectRatio(
            aspectRatio: 16 / 10,
            child: Container(
              color: const Color(0xFF1E3D28),
              child: const Center(
                child: Icon(
                  Icons.image_not_supported_outlined,
                  color: Color(0xFF3A6040),
                  size: 36,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
            child: Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Color(0xFF8B9D83),
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Card — identical to HorizontalResourceCard, adds "NEW" badge only ──────
class _TopPickCard extends StatefulWidget {
  final Resource resource;
  const _TopPickCard({required this.resource});

  @override
  State<_TopPickCard> createState() => _TopPickCardState();
}

class _TopPickCardState extends State<_TopPickCard> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => DetailScreen(
              id: widget.resource.id,
              title: widget.resource.title,
            ),
          ),
        );
      },
      child: RepaintBoundary(
        child: Container(
          // Exactly the same margin, decoration and border as HorizontalResourceCard
          margin: const EdgeInsets.only(left: 8, right: 8, bottom: 20, top: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF1D4724),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.55),
                blurRadius: 16,
                spreadRadius: 2,
                offset: const Offset(0, 10),
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.35),
                blurRadius: 6,
                spreadRadius: 0,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          foregroundDecoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: const Color(0xFF254A30), // Same as HorizontalResourceCard
              width: 1.5,
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Image with "NEW" badge overlay
              Stack(
                children: [
                  Container(
                    width: double.infinity,
                    foregroundDecoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: const Color(0xFF1D4724),
                        width: 4,
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: AspectRatio(
                        aspectRatio: 16 / 10,
                        child: CachedNetworkImage(
                          cacheManager: AppImageCacheManager.instance,
                          memCacheWidth: 600,
                          memCacheHeight: 375,
                          imageUrl: widget.resource.thumbnailUrl.isNotEmpty
                              ? widget.resource.thumbnailUrl
                              : 'https://via.placeholder.com/600x375?text=No+Image',
                          fit: BoxFit.cover,
                          placeholder: (context, url) => const ColoredBox(
                            color: Color(0xFF1E3D28),
                          ),
                          errorWidget: (context, url, error) => Container(
                            color: const Color(0xFF1D4724),
                            child: const Icon(Icons.image_not_supported,
                                color: Colors.white54, size: 40),
                          ),
                        ),
                      ),
                    ),
                  ),
                  // "NEW" badge — lightweight, no animation
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 9, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF67D930),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'NEW',
                        style: TextStyle(
                          color: Color(0xFF163320),
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              // Text section — same as HorizontalResourceCard
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            widget.resource.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Color(0xFFFFFFFF),
                              fontSize: 17,
                              fontWeight: FontWeight.bold,
                              height: 1.25,
                            ),
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.only(top: 2, left: 8),
                          child: Icon(Icons.chevron_right,
                              color: Color(0xFF67D930), size: 20),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            widget.resource.author.isNotEmpty
                                ? widget.resource.author
                                : 'Creator',
                            style: const TextStyle(
                              color: Color(0xFF67D930),
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              height: 1.4,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.star,
                            color: Color(0xFF67D930), size: 13),
                        const SizedBox(width: 4),
                        const Text(
                          '5.0',
                          style: TextStyle(
                            color: Color(0xFF67D930),
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'STAFF PICK · ${_daysAgo(widget.resource.dateModified)} DAYS AGO',
                      style: const TextStyle(
                        color: Color(0xFF8B9D83),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _daysAgo(String dateModified) {
    if (dateModified.isEmpty) return '3';
    try {
      final date = DateTime.parse(dateModified);
      final diff = DateTime.now().difference(date).inDays;
      return diff > 0 ? diff.toString() : '1';
    } catch (_) {
      return '3';
    }
  }
}
