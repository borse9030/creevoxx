import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/resource.dart';
import '../screens/detail_screen.dart';
import '../services/image_cache_manager.dart';

class ResourceCardWidget extends StatefulWidget {
  final Resource resource;

  final bool showDownloadIcon;

  const ResourceCardWidget({
    super.key, 
    required this.resource,
    this.showDownloadIcon = true,
  });

  @override
  State<ResourceCardWidget> createState() => _ResourceCardWidgetState();
}

class _ResourceCardWidgetState extends State<ResourceCardWidget> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isHovered = true),
        onTapUp: (_) => setState(() => _isHovered = false),
        onTapCancel: () => setState(() => _isHovered = false),
        onTap: () {
          setState(() => _isHovered = false);
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => DetailScreen(id: widget.resource.id, title: widget.resource.title),
            ),
          );
        },
        child: RepaintBoundary(
          child: AnimatedScale(
          scale: _isHovered ? 1.05 : 1.0,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeInOut,
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF163320), // Solid dark green background
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(
                    alpha: 0.6,
                  ), // Stronger shadow for 3D effect
                  blurRadius: 16,
                  spreadRadius: 2,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            foregroundDecoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0xFF254A30), // Solid green border
                width: 1,
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
                      color: const Color(0xFF163320), // Matches the card's background color
                      width: 4, // Thicker border
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(24),
                    child: AspectRatio(
                    aspectRatio: 16 / 10, // Adjusted to make image slightly smaller vertically
                    child: CachedNetworkImage(
                      cacheManager: AppImageCacheManager.instance,
                      memCacheWidth: 600, // Downsample image in RAM to save memory and prevent GC stutter
                      memCacheHeight: 375, // 16:10 ratio matches AspectRatio(16/10)
                      imageUrl: widget.resource.thumbnailUrl.isNotEmpty
                          ? widget.resource.thumbnailUrl
                          : '',
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const ColoredBox(
                        color: Color(0xFF1E3D28), // Static dark green, zero AnimationController cost
                      ),
                      errorWidget: (context, url, error) => const Icon(Icons.image_not_supported, color: Colors.white54, size: 40),
                    ),
                  ),
                ),
                ),
                // Bottom text section — shares background with outer container
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 12), // Reduced paddings horizontally and vertically
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
                              color: Color(0xFF67D930), // Bright neon green
                              size: 20, // Reduced chevron size
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2), // Reduced space
                      Text(
                        widget.resource.description.isNotEmpty ? widget.resource.description : 'High quality ${widget.resource.category} packs',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFF67D930), // Bright neon green subtitle
                          fontSize: 14, // Reduced font size
                          fontWeight: FontWeight.w500,
                          height: 1.4,
                        ),
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
