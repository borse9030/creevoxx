import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/resource.dart';
import '../screens/detail_screen.dart';
import '../services/image_cache_manager.dart';

class HorizontalResourceCard extends StatefulWidget {
  final Resource resource;

  const HorizontalResourceCard({super.key, required this.resource});

  @override
  State<HorizontalResourceCard> createState() => _HorizontalResourceCardState();
}

class _HorizontalResourceCardState extends State<HorizontalResourceCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailScreen(
                id: widget.resource.id.toString(),
                title: widget.resource.title,
              ),
            ),
          );
        },
        child: RepaintBoundary(
          child: AnimatedScale(
          scale: _isHovered ? 1.05 : 1.0,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          child: Container(
            margin: const EdgeInsets.only(left: 8, right: 8, bottom: 20, top: 4), // Matches exact gaps from screenshot
            // Removed fixed width so it expands to the PageView's viewport size
            decoration: BoxDecoration(
              color: const Color(0xFF1D4724), // Solid dark green
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                // Softened ambient shadow
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.55), // Increased from 0.4
                  blurRadius: 16, // Increased from 12
                  spreadRadius: 2, // Increased from 1
                  offset: const Offset(0, 10), // Increased from 8
                ),
                // Softened directional drop shadow
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.35), // Increased from 0.25
                  blurRadius: 6, // Increased from 4
                  spreadRadius: 0,
                  offset: const Offset(0, 5), // Increased from 4
                ),
              ],
            ),
            foregroundDecoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0xFF254A30), // Uniform color to prevent borderRadius crash
                width: 1.5,
              ),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Image with its own border matching the card's outer border
                Container(
                  width: double.infinity,
                  foregroundDecoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: const Color(0xFF1D4724), // Matches the card's background color
                      width: 4, // Thicker border
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: AspectRatio(
                    aspectRatio: 16 / 10, // Adjusted to make image slightly smaller vertically
                    child: CachedNetworkImage(
                      cacheManager: AppImageCacheManager.instance,
                      memCacheWidth: 600,
                      imageUrl: widget.resource.thumbnailUrl,
                      fit: BoxFit.cover,
                      // Static placeholder — no AnimationController, no ancestor lookups
                      placeholder: (context, url) => const ColoredBox(
                        color: Color(0xFF1E3D28),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: const Color(0xFF1D4724),
                        child: const Icon(
                          Icons.image_not_supported,
                          color: Colors.white54,
                          size: 40,
                        ),
                      ),
                    ),
                  ),
                ),
                ),
                // Bottom text section — shares background with outer container
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(
                    12,
                    10,
                    12,
                    12,
                  ), // Reduced paddings horizontally and vertically
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
                                color: Color(0xFFFFFFFF), // Pure white title
                                fontSize: 17, // Reduced slightly
                                fontWeight: FontWeight.bold,
                                height: 1.25,
                              ),
                            ),
                          ),
                          const Padding(
                            padding: EdgeInsets.only(top: 2, left: 8),
                            child: Icon(
                              Icons.chevron_right,
                              color: Color(0xFF67D930), // Bright green
                              size: 20, // Reduced chevron size
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2), // Reduced space
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              widget.resource.author.isNotEmpty
                                  ? widget.resource.author
                                  : 'Creator',
                              style: const TextStyle(
                                color: Color(0xFF67D930), // Bright neon green subtitle
                                fontSize: 14, // Reduced font size
                                fontWeight: FontWeight.w500,
                                height: 1.4,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6), // Reduced space
                      Text(
                        'UPDATED ${_calculateDaysAgo(widget.resource.dateModified)} DAYS AGO',
                        style: const TextStyle(
                          color: Color(0xFF8B9D83), // Muted olive
                          fontSize: 11, // Reduced font size
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
        ),
      ),
    );
  }

  String _calculateDaysAgo(String dateModified) {
    if (dateModified.isEmpty) return '3';
    try {
      final date = DateTime.parse(dateModified);
      final difference = DateTime.now().difference(date).inDays;
      return difference > 0 ? difference.toString() : '1';
    } catch (e) {
      return '3';
    }
  }
}
