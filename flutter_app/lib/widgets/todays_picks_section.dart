import 'package:flutter/material.dart';
import '../models/resource.dart';
import '../widgets/horizontal_resource_card.dart';
import '../screens/trending_screen.dart';

class TodaysPicksSection extends StatefulWidget {
  final List<Resource> resources;

  const TodaysPicksSection({super.key, required this.resources});

  @override
  State<TodaysPicksSection> createState() => _TodaysPicksSectionState();
}

class _TodaysPicksSectionState extends State<TodaysPicksSection> {
  late PageController _pageController;
  // Track page as int — updated only on discrete page changes, not every scroll pixel
  int _centerPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(viewportFraction: 0.78); // Smaller fraction to bring cards closer for peeking
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.resources.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Today's Picks",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const TrendingScreen()),
                  );
                },
                child: const Text(
                  'See all',
                  style: TextStyle(
                    color: Color(0xFF67D930),
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 360, // Increased to fit the scaled up center card
          child: PageView.builder(
            clipBehavior: Clip.none,
            controller: _pageController,
            scrollDirection: Axis.horizontal,
            onPageChanged: (page) => setState(() => _centerPage = page),
            itemCount: widget.resources.length,
            itemBuilder: (context, index) {
              final bool isCenter = index == _centerPage;
              return Center(
                child: AnimatedScale(
                  scale: isCenter ? 1.10 : 0.85, // Scale up center to make it big, scale down sides to make them smaller


                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOut,
                  // Removed extra Padding here because HorizontalResourceCard already has margin.
                  // This fixes the issue where previous/next cards were pushed off-screen.
                  child: HorizontalResourceCard(resource: widget.resources[index]),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
