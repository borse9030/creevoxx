import 'dart:async';
import 'package:flutter/material.dart';

import '../models/resource.dart';
import '../services/api_service.dart';
import '../screens/detail_screen.dart';

class HeroHighlightBanner extends StatefulWidget {
  const HeroHighlightBanner({super.key});

  @override
  State<HeroHighlightBanner> createState() => _HeroHighlightBannerState();
}

class _HeroHighlightBannerState extends State<HeroHighlightBanner> {
  List<Resource> _resources = [];
  bool _isLoading = true;
  Timer? _timer;

  // Virtual infinite scroll — same pattern as TopPicksSection.
  // Avoids jumpToPage(0) snap by always animating forward on a huge virtual range.
  static const int _virtualMid = 5000;
  int _virtualPage = _virtualMid;
  late final PageController _pageController;

  /// ValueNotifier instead of setState — only the title Text rebuilds on page change,
  /// NOT the entire widget tree. This is the fix for the 723 rebuilds.
  final ValueNotifier<int> _currentPageNotifier = ValueNotifier<int>(0);

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _virtualMid);
    _fetchPopularResources();
  }

  void _startAutoSwipe() {
    _timer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted || !_pageController.hasClients || _resources.isEmpty) return;
      // Always animate forward — infinite virtual list means no snap-back ever
      _pageController.animateToPage(
        _virtualPage + 1,
        duration: const Duration(milliseconds: 800),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  Future<void> _fetchPopularResources() async {
    try {
      // Use category 'shaders' — it is always already warm-cached by the home screen
      // _fetchResources() call that fires on startup. This avoids a duplicate uncached
      // network call for category 'all' which has a different cache key.
      await ApiService.searchResources(
        query: '',
        category: 'shaders',
        sortField: '2', // Sort by Popularity
        page: 1,
        onCachedData: (cachedData) {
          // Show cached results instantly — no spinner wait
          if (mounted && _resources.isEmpty) {
            final resources = (cachedData['resources'] as List<Resource>);
            final shuffled = List<Resource>.from(resources)..shuffle();
            setState(() {
              _resources = shuffled.take(10).toList();
              _isLoading = false;
            });
            if (_resources.isNotEmpty) _startAutoSwipe();
          }
        },
      ).then((result) {
        // Update from network result (cache-then-network pattern)
        if (mounted && result.containsKey('resources') && result['resources'] != null) {
          final resources = result['resources'] as List<Resource>;
          final shuffled = List<Resource>.from(resources)..shuffle();
          setState(() {
            _resources = shuffled.take(10).toList();
            _isLoading = false;
          });
          // Only start auto-swipe if it hasn't started from cache yet
          if (_timer == null && _resources.isNotEmpty) _startAutoSwipe();
        } else if (mounted) {
          setState(() => _isLoading = false);
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    _currentPageNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const SizedBox(
        height: 220,
        child: Center(
          child: CircularProgressIndicator(color: Color(0xFF67D930)),
        ),
      );
    }

    if (_resources.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16.0),
            height: 280,
            clipBehavior: Clip.hardEdge,
            foregroundDecoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0xFF67D930),
                width: 3.0,
              ),
            ),
            decoration: BoxDecoration(
              color: const Color(0xFF2A5030),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.7),
                  blurRadius: 30,
                  spreadRadius: 10,
                  offset: const Offset(0, 20),
                ),
                BoxShadow(
                  color: const Color(0xFF67D930).withValues(alpha: 0.25),
                  blurRadius: 15,
                  spreadRadius: 1,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: GestureDetector(
              onTap: () {
                if (_resources.isNotEmpty) {
                  final safeIndex = _currentPageNotifier.value.clamp(0, _resources.length - 1);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DetailScreen(
                        id: _resources[safeIndex].id,
                        title: _resources[safeIndex].title,
                      ),
                    ),
                  );
                }
              },
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: Stack(
                  children: [
                    RepaintBoundary(
                      child: PageView.builder(
                        controller: _pageController,
                        // Virtual infinite count — always animate forward, no snap
                        itemCount: null,
                        onPageChanged: (page) {
                          _virtualPage = page;
                          _currentPageNotifier.value = page % _resources.length;
                        },
                        itemBuilder: (context, index) {
                          final resource = _resources[index % _resources.length];
                          return Image.network(
                            resource.thumbnailUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stack) => const ColoredBox(
                              color: Color(0xFF2A5030),
                              child: Icon(Icons.image_not_supported, color: Colors.white54),
                            ),
                          );
                        },
                      ),
                    ),
                    const _StaticBannerOverlay(),
                    Positioned(
                      bottom: 20,
                      left: 20,
                      right: 20,
                      child: IgnorePointer(
                        child: _BannerDynamicTitle(
                          titleNotifier: _currentPageNotifier,
                          resources: _resources,
                        ),
                      ),
                    ),
                    
                    // LAYER 4: Animated shine effect sweeping across the card
                    const Positioned.fill(
                      child: IgnorePointer(
                        child: _ShimmerOverlay(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          // The 3D Ribbon Badge hanging over the edge
          const Positioned(
            top: -4,
            right: 32,
            child: _RibbonBadge(),
          ),
        ],
      ),
    );
  }
}

/// Static overlay — const-constructible, built ONCE, NEVER rebuilt.
class _StaticBannerOverlay extends StatelessWidget {
  const _StaticBannerOverlay();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Dark gradient for text readability
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  const Color(0xFF163320).withValues(alpha: 0.9),
                  Colors.transparent,
                ],
              ),
            ),
          ),
          // Top Left: CURATED SETS
          const Positioned(
            top: 20,
            left: 20,
            child: Row(
              children: [
                Icon(Icons.auto_awesome, color: Color(0xFF67D930), size: 16),
                SizedBox(width: 8),
                Text(
                  'CURATED SETS',
                  style: TextStyle(
                    color: Color(0xFF67D930),
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          // Static "Collections" heading — never changes
          const Positioned(
            bottom: 60,
            left: 20,
            child: Text(
              'Collections',
              style: TextStyle(
                color: Colors.white,
                fontSize: 34,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Only this tiny widget rebuilds when the page changes.
/// Everything else in the banner tree is completely isolated.
class _BannerDynamicTitle extends StatelessWidget {
  final ValueNotifier<int> titleNotifier;
  final List<Resource> resources;

  const _BannerDynamicTitle({
    required this.titleNotifier,
    required this.resources,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: titleNotifier,
      builder: (context, index, _) {
        final title = resources.isNotEmpty ? resources[index].title : '';
        return Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Colors.orange,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Latest: $title',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}


/// Animated shimmer shine overlay that sweeps a gradient across the card.
class _ShimmerOverlay extends StatefulWidget {
  const _ShimmerOverlay();

  @override
  State<_ShimmerOverlay> createState() => _ShimmerOverlayState();
}

class _ShimmerOverlayState extends State<_ShimmerOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          // Slide the gradient from top-left (-2.0) to bottom-right (2.0)
          final x = -2.0 + (_controller.value * 4.0);
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment(x - 0.5, x - 0.5),
                end: Alignment(x + 0.5, x + 0.5),
                colors: [
                  Colors.white.withValues(alpha: 0.0),
                  Colors.white.withValues(alpha: 0.3), // The shine line
                  Colors.white.withValues(alpha: 0.0),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

/// A custom 3D folded ribbon badge for the 'NEW' label.
class _RibbonBadge extends StatelessWidget {
  const _RibbonBadge();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _RibbonPainter(color: const Color(0xFF67D930)),
      child: const Padding(
        padding: EdgeInsets.only(left: 20, right: 20, top: 12, bottom: 20), 
        child: Text(
          'NEW',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w900,
            fontSize: 14,
            letterSpacing: 1.2,
          ),
        ),
      ),
    );
  }
}

class _RibbonPainter extends CustomPainter {
  final Color color;
  _RibbonPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()..style = PaintingStyle.fill;
    
    // The darker shadow color for the ears
    final Color darkColor = const Color(0xFF357A18); // Darker green for shadow
    final Paint darkPaint = Paint()
      ..color = darkColor
      ..style = PaintingStyle.fill;

    // The folded ears (top left and top right)
    final double earWidth = 6.0;
    final double earHeight = 6.0;
    final double topOffset = 4.0; // Overhang height

    // Left Ear (Fold)
    Path leftEar = Path()
      ..moveTo(0, topOffset + earHeight)
      ..lineTo(earWidth, topOffset)
      ..lineTo(earWidth, topOffset + earHeight)
      ..close();
    canvas.drawPath(leftEar, darkPaint);

    // Right Ear (Fold)
    Path rightEar = Path()
      ..moveTo(size.width, topOffset + earHeight)
      ..lineTo(size.width - earWidth, topOffset)
      ..lineTo(size.width - earWidth, topOffset + earHeight)
      ..close();
    canvas.drawPath(rightEar, darkPaint);

    // Main Ribbon Body
    Path mainRibbon = Path()
      ..moveTo(earWidth, 0)
      ..lineTo(size.width - earWidth, 0)
      ..lineTo(size.width - earWidth, size.height) // right edge
      ..lineTo(size.width / 2, size.height - 12) // chevron point
      ..lineTo(earWidth, size.height) // left edge
      ..close();
      
    // Shiny gradient for the ribbon body
    final Rect rect = Rect.fromLTWH(earWidth, 0, size.width - 2 * earWidth, size.height);
    paint.shader = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [
        color,
        color.withValues(alpha: 0.8),
        color,
      ],
      stops: const [0.0, 0.5, 1.0],
    ).createShader(rect);

    // Shadow behind the ribbon
    canvas.drawShadow(mainRibbon, Colors.black, 4.0, true);
    
    // Draw the main ribbon
    canvas.drawPath(mainRibbon, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
