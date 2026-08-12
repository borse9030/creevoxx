import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import '../widgets/network_aware_widget.dart';
import '../models/resource.dart';
import '../services/api_service.dart';
import '../widgets/resource_card.dart';
import '../widgets/collection_ad_card.dart';
import '../widgets/todays_picks_section.dart';
import '../widgets/horizontal_category_section.dart';
import '../widgets/hero_highlight_banner.dart';
import '../widgets/app_error_widget.dart';
import '../widgets/top_picks_section.dart';
import 'favorites_screen.dart';
import 'settings_screen.dart';
import 'downloads_screen.dart';
import 'collection_screen.dart';
import 'trending_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  String _currentCategory = 'shaders';
  String _currentQuery = '';
  String? _activeFilterLabel;    // Which filter chip is currently selected
  int? _currentFilterCategoryId; // Real CurseForge subcategory ID (null = no tag filter)
  int _selectedNavIndex = 0; // 0=Home, 1=Search, 2=Collections, 3=Saved

  // --- All 6 main categories (horizontally scrollable top row) ---
  static const List<Map<String, dynamic>> _mainCategories = [
    {'id': 'shaders',     'label': 'Shaders',     'emoji': '✦'},
    {'id': 'textures',    'label': 'Textures',    'emoji': '◈'},
    {'id': 'mods',        'label': 'Addons',      'emoji': '◈'},
    {'id': 'maps',        'label': 'Maps',        'emoji': '🗺'},
    {'id': 'skins',       'label': 'Skins',       'emoji': '👤'},
    {'id': 'collections', 'label': 'Collections', 'emoji': '⊞'},
  ];

  // --- Real CurseForge subcategory ID mappings with emoji labels ---
  static const Map<String, Map<String, dynamic>> _shaderFilters = {
    'All Shaders':     {'emoji': '⭐', 'isAll': true},
    'RenderDragon':    {'emoji': '🐲', 'query': 'render dragon'},
    'Vibrant Visuals': {'emoji': '✨', 'query': 'vibrant'},
    'Vanilla+':        {'emoji': '🌿', 'query': 'vanilla'},
    'Low End Lite':    {'emoji': '⚡', 'query': 'lite'},
    'RTX Realism':     {'emoji': '⭐', 'query': 'rtx'},
  };

  static const Map<String, Map<String, dynamic>> _textureFilters = {
    'All Textures': {'emoji': '🎨', 'isAll': true},
    'PVP':          {'emoji': '⚔', 'categoryId': 6931},
    'RTX':          {'emoji': '💎', 'query': 'rtx'},
    '3D Packs':     {'emoji': '🧊', 'categoryId': 11330},
    'Faithful':     {'emoji': '🌟', 'query': 'faithful'},
    'Medieval':     {'emoji': '🏰', 'query': 'medieval'},
    'Modern':       {'emoji': '🌆', 'query': 'modern'},
    'Realistic':    {'emoji': '🌅', 'categoryId': 6932},
  };

  static const Map<String, Map<String, dynamic>> _modFilters = {
    'All Addons': {'emoji': '🔮', 'isAll': true},
    'Furniture':  {'emoji': '🛋', 'query': 'furniture'},
    'Weapons':    {'emoji': '⚔', 'categoryId': 8834},
    'Vehicles':   {'emoji': '🚗', 'query': 'vehicles'},
    'Magic':      {'emoji': '🔮', 'categoryId': 8829},
    'Tech':       {'emoji': '⚙', 'categoryId': 8826},
    'Mobs':       {'emoji': '🐾', 'query': 'mobs'},
    'Utility':    {'emoji': '🔧', 'categoryId': 8832},
  };

  static const Map<String, Map<String, dynamic>> _mapFilters = {
    'All Maps':  {'emoji': '🗺', 'isAll': true},
    'Adventure': {'emoji': '🏰', 'categoryId': 6914},
    'Survival':  {'emoji': '🌿', 'categoryId': 6924},
    'Puzzle':    {'emoji': '🧩', 'categoryId': 6920},
    'Parkour':   {'emoji': '🏃', 'categoryId': 6919},
    'PvP':       {'emoji': '⚔', 'categoryId': 6921},
    'Minigame':  {'emoji': '🎮', 'categoryId': 6918},
  };

  static const Map<String, Map<String, dynamic>> _skinFilters = {
    'All Skins': {'emoji': '👤', 'isAll': true},
    'Players':   {'emoji': '👨', 'categoryId': 4990},
    'Mobs':      {'emoji': '🐾', 'categoryId': 4991},
  };

  Map<String, Map<String, dynamic>> get _currentFilters {
    switch (_currentCategory) {
      case 'textures':    return _textureFilters;
      case 'mods':        return _modFilters;
      case 'maps':        return _mapFilters;
      case 'skins':       return _skinFilters;
      case 'collections': return {}; // Collections screen, no sub-filters
      case 'shaders':
      default:            return _shaderFilters;
    }
  }

  // Search results
  List<Resource> _resources = [];
  bool _isLoading = true;
  bool _hasError = false;
  String? _errorMessage;
  int _page =
      Random().nextInt(5) + 1; // Start on a random page (1-5) for variety
  int _totalCount = 0;
  final ScrollController _scrollController = ScrollController();
  Timer? _debounceTimer;
  Key _topPicksKey = UniqueKey(); // Changes this key to force TopPicksSection to re-init

  @override
  void initState() {
    super.initState();
    _fetchResources();
  }

  /// Called by NetworkAwareWidget when the device comes back online.
  /// Re-fetches the resource list and forces TopPicksSection to rebuild.
  void _onReconnected() {
    if (!mounted) return;
    _fetchResources();
    setState(() => _topPicksKey = UniqueKey());
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    _searchFocusNode.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  /// Debounced search: waits 1500ms after last keystroke before firing an API call.
  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 1500), () {
      if (query == _currentQuery) return; // No change — skip
      setState(() {
        _currentQuery = query;
        _page = 1;
      });
      _fetchResources();
    });
  }

  Future<void> _fetchResources({bool scrollToTop = false}) async {
    // Only show loading spinner when there's nothing to display yet.
    // If _resources is already populated (from cache), skip the spinner
    // to avoid the flicker/blank-flash when returning to the home tab.
    if (_resources.isEmpty) {
      setState(() => _isLoading = true);
    }

    try {
      final result = await ApiService.searchResources(
        query: _currentQuery,
        category: _currentCategory,
        page: _page,
        categoryId: _currentFilterCategoryId, // real CurseForge subcategory filter
        sortField: '2', // Sort by Popularity
        onCachedData: (cachedData) {
          if (mounted) {
            setState(() {
              _resources = cachedData['resources'];
              _totalCount = cachedData['totalCount'];
              _isLoading = false;
            });
          }
        },
      );

      // Guard: api_service returns {} when network fails but cached data was
      // already served via onCachedData. In that case result['resources'] is
      // null and assigning it to the non-nullable List<Resource> causes a crash.
      if (mounted && result.containsKey('resources') && result['resources'] != null) {
        setState(() {
          _resources = result['resources'] as List<Resource>;
          _totalCount = (result['totalCount'] as int?) ?? _totalCount;
          _isLoading = false;
        });

        if (scrollToTop && _scrollController.hasClients) {
          _scrollController.animateTo(
            0,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      } else if (mounted) {
        // Network failed but cache was already shown — just stop the spinner
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasError = _resources.isEmpty; // Only show error if no cached data shown
          _errorMessage = e.toString();
        });
      }
    }
  }

  void _onSearchSubmit(String query) {
    setState(() {
      _currentQuery = query;
      _page = 1;
    });
    _fetchResources();
  }

  void _onCategorySelect(String category) {
    _debounceTimer?.cancel();
    setState(() {
      if (_currentCategory != category) {
        _currentCategory = category;
      }
      // Reset everything when switching main category
      _currentQuery = '';
      _activeFilterLabel = null;
      _currentFilterCategoryId = null;
      _page = 1;
    });
    _searchController.clear();
    _fetchResources();
  }

  @override
  Widget build(BuildContext context) {
    return NetworkAwareWidget(
      onReconnected: _onReconnected,
      child: Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFF163320), // Deep obsidian background
      drawer: Drawer(
        backgroundColor: const Color(0xFF163320), // Drawer deep obsidian background
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24.0),
                child: Text(
                  'Shaders and Textures\nfor Minecraft',
                  style: TextStyle(
                    color: Color(0xFF67D930),
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    height: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24.0),
                child: Divider(color: Colors.white12, height: 1),
              ),
              const SizedBox(height: 16),
              _buildDrawerItem(
                icon: Icons.home,
                title: 'Home',
                isActive: true,
                onTap: () => Navigator.pop(context),
              ),
              _buildDrawerItem(
                icon: Icons.favorite,
                title: 'Favorites',
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const FavoritesScreen(),
                    ),
                  );
                },
              ),
              _buildDrawerItem(
                icon: Icons.download,
                title: 'My Downloads',
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const DownloadsScreen(),
                    ),
                  );
                },
              ),
              _buildDrawerItem(
                icon: Icons.collections,
                title: 'Collections',
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const CollectionScreen(),
                    ),
                  );
                },
              ),
              _buildDrawerItem(
                icon: Icons.trending_up,
                title: 'Trending',
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const TrendingScreen(),
                    ),
                  );
                },
              ),
              _buildDrawerItem(
                icon: Icons.settings,
                title: 'Settings',
                onTap: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const SettingsScreen(),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
      body: Stack(
        children: [
          if (_selectedNavIndex == 2)
            const CollectionScreen(isBottomTab: true)
          else if (_selectedNavIndex == 3)
            const FavoritesScreen(isBottomTab: true)
          else
            SafeArea(
            child: CustomScrollView(
              controller: _scrollController,
              cacheExtent: 2500, // Reduced to prevent 429 API rate limit errors from simultaneous fetches
              slivers: [
                SliverToBoxAdapter(
                  child: _buildHeroSection(),
                ),
                if (_currentCategory == 'shaders' && _currentQuery.isEmpty)
                  SliverToBoxAdapter(
                    child: Column(
                      children: [
                        TopPicksSection(key: _topPicksKey),
                        HorizontalCategorySection(
                          title: 'Render Dragon Shaders',
                          query: 'RenderDragonGrid', // Special query to lock grid items
                          category: 'shaders',
                          onSeeAll: () => _onSearchSubmit('Render Dragon'),
                        ),
                        const SizedBox(height: 16),
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16.0),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              'HIGHLIGHTED COLLECTIONS',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        const HeroHighlightBanner(),
                        const SizedBox(height: 56), // Increased significantly to fit the large 3D shadow
                        HorizontalCategorySection(
                          title: 'Vibrant Visual Shaders',
                          query: 'VibrantVisualsGrid', // Special query to lock grid items
                          category: 'shaders',
                          onSeeAll: () => _onSearchSubmit('Vibrant Visual'),
                        ),
                        HorizontalCategorySection(
                          title: 'Low End Shaders',
                          query: 'lite',          // 'lite' = shaders made for low-spec devices
                          category: 'shaders',
                          onSeeAll: () => _onSearchSubmit('Low End'),
                        ),
                        HorizontalCategorySection(
                          title: 'High End Shaders',
                          query: 'deferred',      // 'deferred' = Deferred Rendering, Bedrock's most advanced shaders
                          category: 'shaders',
                          onSeeAll: () => _onSearchSubmit('High End'),
                        ),
                      ],
                    ),
                  )
                else if (_currentCategory == 'textures' && _currentQuery.isEmpty)
                  SliverToBoxAdapter(
                    child: Column(
                      children: [
                        HorizontalCategorySection(
                          title: 'PVP Textures',
                          query: 'PVP',
                          category: 'textures',
                          onSeeAll: () => _onSearchSubmit('PVP'),
                        ),
                        HorizontalCategorySection(
                          title: 'RTX Textures',
                          query: 'RTX',
                          category: 'textures',
                          onSeeAll: () => _onSearchSubmit('RTX'),
                        ),
                        HorizontalCategorySection(
                          title: '3D Textures',
                          query: '3D',
                          category: 'textures',
                          onSeeAll: () => _onSearchSubmit('3D'),
                        ),
                        HorizontalCategorySection(
                          title: 'Faithful Textures',
                          query: 'Faithful',
                          category: 'textures',
                          onSeeAll: () => _onSearchSubmit('Faithful'),
                        ),
                        HorizontalCategorySection(
                          title: 'Realistic Textures',
                          query: 'Realistic',
                          category: 'textures',
                          onSeeAll: () => _onSearchSubmit('Realistic'),
                        ),
                      ],
                    ),
                  )
                else if (_currentCategory == 'mods' && _currentQuery.isEmpty)
                  SliverToBoxAdapter(
                    child: Column(
                      children: [
                        HorizontalCategorySection(
                          title: 'Furniture Mods',
                          query: 'Furniture',
                          category: 'mods',
                          onSeeAll: () => _onSearchSubmit('Furniture'),
                        ),
                        HorizontalCategorySection(
                          title: 'Weapons Mods',
                          query: 'Weapons',
                          category: 'mods',
                          onSeeAll: () => _onSearchSubmit('Weapons'),
                        ),
                        HorizontalCategorySection(
                          title: 'Vehicles Mods',
                          query: 'Vehicles',
                          category: 'mods',
                          onSeeAll: () => _onSearchSubmit('Vehicles'),
                        ),
                        HorizontalCategorySection(
                          title: 'Magic Mods',
                          query: 'Magic',
                          category: 'mods',
                          onSeeAll: () => _onSearchSubmit('Magic'),
                        ),
                        HorizontalCategorySection(
                          title: 'Tech Mods',
                          query: 'Tech',
                          category: 'mods',
                          onSeeAll: () => _onSearchSubmit('Tech'),
                        ),
                      ],
                    ),
                  )
                else if (_isLoading && _resources.isEmpty)
                  const SliverFillRemaining(
                    child: SizedBox.shrink(), // Static — no spinner AnimationController while loading
                  )
                else if (_hasError && _resources.isEmpty)
                  // FIX 7: Show friendly error UI instead of blank screen
                  SliverFillRemaining(
                    child: AppErrorWidget(
                      message: _errorMessage,
                      onRetry: () {
                        setState(() {
                          _hasError = false;
                          _errorMessage = null;
                        });
                        _fetchResources();
                      },
                    ),
                  )
                else if (_resources.isEmpty)
                  const SliverFillRemaining(
                    child: Center(
                      child: Text(
                        'No resources found.',
                        style: TextStyle(color: Colors.white54),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.only(
                      left: 16.0,
                      right: 16.0,
                      top: 24.0,
                      bottom: 0.0,
                    ),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          // Require >= 9 items: sublist(4,8) needs indices 0-7,
                          // and we also serve items at index+2 after the injected
                          // sections, so we need at least one extra item beyond 8.
                          final bool showInjectedSections =
                              _resources.length >= 9;
                          final int resourceItemsCount = showInjectedSections
                              ? _resources.length - 4
                              : _resources.length;
                          final int totalItems =
                              resourceItemsCount +
                              (showInjectedSections ? 3 : 1);

                          if (index == totalItems - 1) {
                            return _buildPaginationControls();
                          }

                          if (showInjectedSections) {
                            if (index < 4) {
                              // Guard: index must be within bounds
                              if (index >= _resources.length) return const SizedBox.shrink();
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 24.0),
                                child: ResourceCardWidget(
                                  resource: _resources[index],
                                ),
                              );
                            } else if (index == 4) {
                              return const Padding(
                                padding: EdgeInsets.only(bottom: 24.0),
                                child: CollectionAdCard(),
                              );
                            } else if (index == 5) {
                              // sublist(4, 8) requires _resources.length >= 9
                              // (already guaranteed by showInjectedSections check above)
                              final end = _resources.length.clamp(4, _resources.length);
                              final sliceEnd = (end < 8 ? end : 8);
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 24.0),
                                child: TodaysPicksSection(
                                  resources: _resources.sublist(4, sliceEnd),
                                ),
                              );
                            } else {
                              // index+2 offset: guard against out-of-bounds
                              final resourceIndex = index + 2;
                              if (resourceIndex >= _resources.length) return const SizedBox.shrink();
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 24.0),
                                child: ResourceCardWidget(
                                  resource: _resources[resourceIndex],
                                ),
                              );
                            }
                          } else {
                            if (index >= _resources.length) return const SizedBox.shrink();
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 24.0),
                              child: ResourceCardWidget(
                                resource: _resources[index],
                              ),
                            );
                          }
                        },
                        childCount: (() {
                          final bool showInjected = _resources.length >= 9;
                          final int resCount = showInjected
                              ? _resources.length - 4
                              : _resources.length;
                          return resCount + (showInjected ? 3 : 1);
                        })(),
                      ),
                    ),
                  ),
                SliverToBoxAdapter(
                  child: SizedBox(height: 100),
                ),
              ],
            ),
          ),
          // Floating bottom dock
          Positioned(
            left: 20,
            right: 20,
            bottom: 24,
            child: _buildBottomDock(),
          ),
        ],
      ),
    ));
  }

  Widget _buildBottomDock() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF09140D), // Very dark background
        borderRadius: BorderRadius.circular(50),
        border: Border.all(
          color: const Color(0xFF103622), // Thin green outer border
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 24,
            spreadRadius: 2,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildDockItem(
            index: 0,
            icon: Icons.home_outlined,
            activeIcon: Icons.home_rounded,
            label: 'Home',
            onTap: () {
              _debounceTimer?.cancel();
              setState(() {
                _selectedNavIndex = 0;
                _currentCategory = 'shaders';
                _currentQuery = '';
                _activeFilterLabel = null;
                _currentFilterCategoryId = null;
              });
              _searchController.clear();
              if (_scrollController.hasClients) {
                _scrollController.animateTo(0,
                    duration: const Duration(milliseconds: 400),
                    curve: Curves.easeOut);
              }
              _fetchResources(scrollToTop: true);
            },
          ),
          _buildDockItem(
            index: 1,
            icon: Icons.search_outlined,
            activeIcon: Icons.search_rounded,
            label: 'Search',
            onTap: () {
              setState(() => _selectedNavIndex = 1);
              if (_scrollController.hasClients) {
                _scrollController.animateTo(0,
                    duration: const Duration(milliseconds: 400),
                    curve: Curves.easeOut);
              }
              _searchFocusNode.requestFocus();
            },
          ),
          _buildDockItem(
            index: 2,
            icon: Icons.grid_view_outlined,
            activeIcon: Icons.grid_view_rounded,
            label: 'Collections',
            onTap: () => setState(() => _selectedNavIndex = 2),
          ),
          _buildDockItem(
            index: 3,
            icon: Icons.bookmark_outline_rounded,
            activeIcon: Icons.bookmark_rounded,
            label: 'Saved',
            onTap: () => setState(() => _selectedNavIndex = 3),
          ),
        ],
      ),
    );
  }

  Widget _buildDockItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required VoidCallback onTap,
  }) {
    final bool isActive = _selectedNavIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          padding: EdgeInsets.symmetric(
            horizontal: isActive ? 10 : 4,
            vertical: 8,
          ),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFF103622) : Colors.transparent, // Dark green pill
            borderRadius: BorderRadius.circular(40),
            border: Border.all(
              color: isActive ? const Color(0xFF1F5F40) : Colors.transparent, // Subtle green border on pill
              width: 1.0,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isActive ? activeIcon : icon,
                color: isActive ? const Color(0xFF00E676) : const Color(0xFFA0A0A0), // Neon green active, light grey inactive
                size: 22,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: isActive ? const Color(0xFF00E676) : const Color(0xFFA0A0A0),
                  fontSize: 10,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isActive = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 4.0),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(30),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: isActive
                ? const Color(0xFF67D930).withValues(alpha: 0.15)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(30),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                color: isActive ? const Color(0xFF67D930) : Colors.white70,
                size: 24,
              ),
              const SizedBox(width: 16),
              Text(
                title,
                style: TextStyle(
                  color: isActive ? const Color(0xFF67D930) : Colors.white,
                  fontSize: 16,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaginationControls() {
    int totalPages = (_totalCount / 10).ceil();
    if (totalPages <= 1) return const SizedBox();

    return Padding(
      padding: const EdgeInsets.only(top: 16.0, bottom: 40.0),
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildPageButton(
              Icons.chevron_left,
              isArrow: true,
              onPressed: _page > 1
                  ? () {
                      setState(() => _page--);
                      _fetchResources(scrollToTop: true);
                    }
                  : null,
            ),
            const SizedBox(width: 24),
            Text(
              'Page $_page of $totalPages',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(width: 24),
            _buildPageButton(
              Icons.chevron_right,
              isArrow: true,
              onPressed: _page < totalPages
                  ? () {
                      setState(() => _page++);
                      _fetchResources(scrollToTop: true);
                    }
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPageButton(
    dynamic labelOrIcon, {
    required bool isArrow,
    bool isActive = false,
    VoidCallback? onPressed,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: isActive
              ? const Color(0xFF67D930)
              : (onPressed == null
                    ? const Color(0xFF2A5030).withOpacity(0.3)
                    : const Color(0xFF2A5030)),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive
                ? const Color(0xFF67D930)
                : const Color(0xFF67D930).withOpacity(0.2),
          ),
        ),
        alignment: Alignment.center,
        child: isArrow
            ? Icon(
                labelOrIcon as IconData,
                color: onPressed == null ? Colors.white24 : Colors.white,
              )
            : Text(
                labelOrIcon as String,
                style: TextStyle(
                  color: isActive ? Colors.black : Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      width: double.infinity,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 24, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Drawer and Search Bar
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.menu, color: Colors.white),
                onPressed: () {
                  _scaffoldKey.currentState?.openDrawer();
                },
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  height: 56, // Increased height
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A5030),
                    borderRadius: BorderRadius.circular(100), // Perfect capsule shape
                    border: Border.all(
                      color: const Color(0xFF67D930), // Bright neon green border
                      width: 1.5, // Thicker, visible border
                    ),
                  ),
                  child: Center( // Centers the text field vertically
                    child: TextField(
                      focusNode: _searchFocusNode,
                      controller: _searchController,
                      onChanged: _onSearchChanged,
                      onSubmitted: _onSearchSubmit,
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                      decoration: InputDecoration(
                        hintText: 'Search for more..',
                        hintStyle: const TextStyle(
                          color: Colors.white54,
                          fontSize: 15,
                        ),
                        prefixIcon: IconButton(
                          icon: const Icon(Icons.search, color: Colors.white54),
                          onPressed: () =>
                              _onSearchSubmit(_searchController.text),
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 16), // Adjusted padding
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          // Row 1: Main category pills (horizontally scrollable)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.only(right: 8),
            child: Row(
              children: _mainCategories.map((cat) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: _buildCategoryPill(cat['id']!, cat['label']!, cat['emoji']!),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 10),
          // Row 2: Sub-filter chips (horizontally scrollable, inline)
          if (_currentFilters.isNotEmpty)
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.only(right: 8),
              child: Row(
                children: _currentFilters.keys.map((label) {
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: _buildSubFilterChip(label),
                  );
                }).toList(),
              ),
            ),
          const SizedBox(height: 32),
          const Text(
            'Best Mods, Shaders and\nTextures for Minecraft',
            style: TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.bold,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Enhance your world with top MCPE addons',
            style: TextStyle(color: Color(0xFF67D930), fontSize: 16, fontWeight: FontWeight.w500),
          ),
        ],
      ),
      ),
    );
  }

  Widget _buildCategoryPill(String id, String label, String emoji) {
    final bool isActive = _currentCategory == id;
    return GestureDetector(
      onTap: () {
        if (id == 'collections') {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const CollectionScreen()));
          return;
        }
        _onCategorySelect(id);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(
          color: isActive ? const Color(0xFF26C477) : const Color(0xFF131D17),
          borderRadius: BorderRadius.circular(50),
          border: Border.all(
            color: isActive ? const Color(0xFF26C477) : Colors.white24,
            width: 1.0,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(emoji, style: TextStyle(fontSize: isActive ? 13 : 12)),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                color: isActive ? Colors.black : Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubFilterChip(String label) {
    final filterDef = _currentFilters[label];
    final bool isAll = filterDef?['isAll'] == true;
    // 'All X' chip is active when no filter label is selected
    final bool isActive = isAll
        ? _activeFilterLabel == null
        : _activeFilterLabel == label;
    final String emoji = filterDef?['emoji'] as String? ?? '';
    final bool usesRealCategory = filterDef?.containsKey('categoryId') ?? false;

    return GestureDetector(
      onTap: () {
        _debounceTimer?.cancel();
        if (isAll || isActive) {
          // Tap 'All' or active chip → clear filter
          setState(() {
            _activeFilterLabel = null;
            _currentFilterCategoryId = null;
            _currentQuery = '';
            _page = 1;
          });
        } else {
          setState(() {
            _activeFilterLabel = label;
            if (usesRealCategory) {
              _currentFilterCategoryId = filterDef!['categoryId'] as int;
              _currentQuery = '';
            } else {
              _currentFilterCategoryId = null;
              _currentQuery = filterDef?['query'] as String? ?? label;
            }
            _page = 1;
          });
        }
        _searchController.clear();
        _fetchResources(scrollToTop: true);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          // Active: solid green fill (matches main category pill style)
          // Inactive: dark background with subtle border
          color: isActive ? const Color(0xFF26C477) : const Color(0xFF131D17),
          borderRadius: BorderRadius.circular(50),
          border: Border.all(
            color: isActive
                ? const Color(0xFF26C477)
                : const Color(0xFF2E3A32),
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (emoji.isNotEmpty) ...[
              Text(emoji, style: const TextStyle(fontSize: 13)),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: TextStyle(
                // Active: black text on green (matches main category pill)
                color: isActive ? Colors.black : Colors.white,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
