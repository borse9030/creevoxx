import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:open_filex/open_filex.dart';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/resource_details.dart';
import '../models/resource.dart';
import '../services/api_service.dart';
import '../services/favorites_manager.dart';
import '../services/downloads_manager.dart';
import '../widgets/horizontal_resource_card.dart';
import '../widgets/banner_ad_widget.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import '../helpers/ad_helper.dart';

class DetailScreen extends StatefulWidget {
  final String id;
  final String title;

  const DetailScreen({super.key, required this.id, required this.title});

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  ResourceDetails? _details;
  List<Resource> _similarResources = [];
  bool _isLoading = true;
  bool _isDownloading = false;
  double? _downloadProgress; // null = indeterminate (server didn't send Content-Length)
  String? _downloadedFilePath;
  bool _isLiked = false;
  late final PageController _screenshotController;

  InterstitialAd? _interstitialAd;
  bool _isInterstitialAdLoaded = false;

  @override
  void initState() {
    super.initState();
    _screenshotController = PageController(viewportFraction: 0.72);
    _fetchDetails();
    _checkFavorite();
    _loadInterstitialAd();
  }

  void _loadInterstitialAd() {
    InterstitialAd.load(
      adUnitId: AdHelper.interstitialAdUnitId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          debugPrint('$ad loaded.');
          _interstitialAd = ad;
          _isInterstitialAdLoaded = true;
          _interstitialAd?.fullScreenContentCallback = FullScreenContentCallback(
            onAdDismissedFullScreenContent: (ad) {
              ad.dispose();
              _loadInterstitialAd(); // Load the next ad for the next download
            },
            onAdFailedToShowFullScreenContent: (ad, err) {
              ad.dispose();
            },
          );
        },
        onAdFailedToLoad: (err) {
          debugPrint('InterstitialAd failed to load: $err');
          _isInterstitialAdLoaded = false;
        },
      ),
    );
  }

  @override
  void dispose() {
    _interstitialAd?.dispose();
    _screenshotController.dispose();
    super.dispose();
  }

  Future<void> _checkFavorite() async {
    final isFav = await FavoritesManager.isFavorite(widget.id);
    if (mounted) {
      setState(() {
        _isLiked = isFav;
      });
    }
  }

  Future<void> _fetchDetails() async {
    try {
      final details = await ApiService.getResourceDetails(
        widget.id,
        onCachedData: (cachedDetails) {
          if (mounted) {
            setState(() {
              _details = cachedDetails;
              _isLoading = false; // Stop loading spinner
            });
          }
        },
      );
      if (mounted) {
        setState(() {
          _details = details;
          _isLoading = false; // Stop loading spinner so UI appears instantly
        });
        _checkIfAlreadyDownloaded();
      }
      
      // Fetch similar resources asynchronously in background
      _fetchSimilarResources(details);
      
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _fetchSimilarResources(ResourceDetails details) async {
    try {
      List<Resource> similar = [];
      // Use first meaningful word of the resource name to find truly similar shaders
      final nameWords = details.name.split(RegExp(r'\s+'))
          .where((w) => w.length > 3)
          .toList();
      final searchQuery = nameWords.isNotEmpty ? nameWords.first : '';
      final similarResult = await ApiService.searchResources(
        category: details.category,
        query: searchQuery,
        sortField: '2', // Sort by popularity for best results
      );
      similar = (similarResult['resources'] as List<Resource>)
          .where((r) => r.id.toString() != widget.id)
          .take(10)
          .toList();
      // If too few results with name query, fallback to category only
      if (similar.length < 3) {
        final fallback = await ApiService.searchResources(
          category: details.category,
          sortField: '2',
        );
        similar = (fallback['resources'] as List<Resource>)
            .where((r) => r.id.toString() != widget.id)
            .take(10)
            .toList();
      }
      if (mounted) {
        setState(() {
          _similarResources = similar;
        });
      }
    } catch (e) {
      // ignore
    }
  }

  Future<void> _launchUrl(String? urlStr) async {
    if (urlStr == null || urlStr.isEmpty) return;
    final Uri url = Uri.parse(urlStr);
    if (!await launchUrl(url, mode: LaunchMode.inAppWebView)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open link')),
        );
      }
    }
  }



  Future<void> _checkIfAlreadyDownloaded() async {
    if (_details == null || _details!.downloadUrl == null) return;
    try {
      final url = _details!.downloadUrl!;
      String ext = '.mcpack';
      if (url.contains('.mcworld')) ext = '.mcworld';
      else if (url.contains('.mcaddon')) ext = '.mcaddon';
      else if (url.contains('.mcpack')) ext = '.mcpack';
      else if (url.contains('.jar')) ext = '.jar';
      else if (url.contains('.zip')) ext = '.zip';
      
      final safeName = _details!.name.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
      final fileName = '$safeName$ext';

      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/$fileName');
      if (await file.exists()) {
        if (mounted) {
          setState(() {
            _downloadedFilePath = file.path;
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _downloadFile(String urlStr, String fileName) async {
    if (urlStr.isEmpty) return;

    setState(() {
      _isDownloading = true;
      _downloadProgress = null; // Start indeterminate until Content-Length is known
    });

    try {
      final request = http.Request('GET', Uri.parse(urlStr));
      final response = await http.Client().send(request);

      final contentLength = response.contentLength ?? 0;
      int receivedBytes = 0;

      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/$fileName');
      final sink = file.openWrite();

      // Listen chunk-by-chunk so setState fires accurately per received chunk,
      // instead of inside a .map() transform that may batch updates before pipe resolves.
      await response.stream.listen(
        (chunk) {
          sink.add(chunk);
          receivedBytes += chunk.length;
          if (contentLength > 0 && mounted) {
            setState(() {
              _downloadProgress =
                  (receivedBytes / contentLength).clamp(0.0, 1.0);
            });
          }
        },
        onError: (e) {
          sink.close();
          throw e;
        },
        cancelOnError: true,
      ).asFuture();

      // Flush & close the file BEFORE updating UI state
      await sink.flush();
      await sink.close();

      if (!mounted) return;

      setState(() {
        _isDownloading = false;
        _downloadProgress = 1.0;
        _downloadedFilePath = file.path;
      });

      if (_details != null) {
        final resource = Resource(
          id: _details!.id.toString(),
          docId: _details!.id.toString(),
          curseforgeId: _details!.id,
          title: _details!.name,
          description: _details!.summary,
          category: _details!.category,
          version: '',
          thumbnailUrl: _details!.logoUrl ?? (_details!.screenshotUrls.isNotEmpty ? _details!.screenshotUrls.first : ''),
          author: _details!.authorNames.isNotEmpty ? _details!.authorNames.first : '',
          downloadCount: _details!.downloadCount ?? 0,
          dateModified: _details!.dateModified ?? '',
          tags: [],
        );
        await DownloadsManager.addDownload(resource);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('File downloaded successfully')));
        
        // Show interstitial ad AFTER download succeeds (policy compliant)
        if (_isInterstitialAdLoaded && _interstitialAd != null) {
          _interstitialAd!.show();
          _isInterstitialAdLoaded = false;
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isDownloading = false;
          _downloadProgress = null;
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Download failed: $e')));
      }
    }
  }


  Future<void> _toggleFavorite() async {
    if (_details != null) {
      final resource = Resource(
        id: _details!.id.toString(),
        docId: _details!.id.toString(),
        curseforgeId: _details!.id,
        title: _details!.name,
        description: _details!.summary,
        category: _details!.category,
        version: '',
        thumbnailUrl: _details!.logoUrl ?? (_details!.screenshotUrls.isNotEmpty ? _details!.screenshotUrls.first : ''),
        author: _details!.authorNames.isNotEmpty ? _details!.authorNames.first : '',
        downloadCount: _details!.downloadCount ?? 0,
        dateModified: _details!.dateModified ?? '',
        tags: [],
      );
      await FavoritesManager.toggleFavorite(resource);
      setState(() => _isLiked = !_isLiked);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isLiked ? 'Added to favorites' : 'Removed from favorites'),
            backgroundColor: const Color(0xFF67D930),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF163320),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.title,
          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          IconButton(
            icon: Icon(_isLiked ? Icons.favorite : Icons.favorite_border, color: _isLiked ? const Color(0xFF67D930) : Colors.white),
            onPressed: _toggleFavorite,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF67D930)))
          : _details == null
              ? const Center(child: Text('Failed to load details', style: TextStyle(color: Colors.white)))
              : Stack(
                  children: [
                    SingleChildScrollView(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 100.0), // bottom padding for floating button
                        child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          _details!.name,
                          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white, height: 1.2),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 16),
                        if (_details!.screenshotUrls.isNotEmpty || _details!.logoUrl != null)
                          SizedBox(
                            height: 240, // Increased height to accommodate shadow
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              clipBehavior: Clip.none, // Don't clip shadows
                              itemCount: _details!.screenshotUrls.isNotEmpty ? _details!.screenshotUrls.length : 1,
                              itemBuilder: (context, index) {
                                final url = _details!.screenshotUrls.isNotEmpty ? _details!.screenshotUrls[index] : _details!.logoUrl!;
                                return Container(
                                  width: 320,
                                  margin: const EdgeInsets.only(right: 16, bottom: 20, top: 4), // Margin for shadow
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0C1210),
                                    borderRadius: BorderRadius.circular(20),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.95), // 3D drop shadow
                                        blurRadius: 18,
                                        offset: const Offset(4, 12),
                                      ),
                                    ],
                                  ),
                                  foregroundDecoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFF67D930), width: 2.0),
                                  ),
                                  clipBehavior: Clip.antiAlias,
                                  child: CachedNetworkImage(
                                    imageUrl: url,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => const Center(child: CircularProgressIndicator(color: Color(0xFF67D930))),
                                    errorWidget: (context, url, error) => const Icon(Icons.image_not_supported, color: Colors.white54, size: 50),
                                  ),
                                );
                              },
                            ),
                          ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: const Color(0xFF223021),
                              radius: 28,
                              child: Text(
                                _details!.authorNames.isNotEmpty ? _details!.authorNames.first[0].toUpperCase() : 'C',
                                style: const TextStyle(color: Color(0xFF67D930), fontSize: 24, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          _details!.authorNames.isNotEmpty ? _details!.authorNames.first : "Creator",
                                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      const Icon(Icons.verified, color: Color(0xFF67D930), size: 18),
                                    ],
                                  ),
                                  Text(
                                    '${_details!.category.toUpperCase()} CREATOR',
                                    style: const TextStyle(color: Color(0xFF67D930), fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                            GestureDetector(
                              onTap: () {
                                SharePlus.instance.share(ShareParams(text: 'Check out ${_details!.name} on MCPE Shaders and Textures!\nhttps://www.creevoxx.dev/resource/${_details!.id}'));
                              },
                              child: Container(
                                width: 46,
                                height: 46,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0C1210),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: const Color(0xFF67D930).withValues(alpha: 0.6), width: 1.5),
                                ),
                                child: const Icon(Icons.share, color: Colors.white70, size: 20),
                              ),
                            ),
                            const SizedBox(width: 12),
                            GestureDetector(
                              onTap: _toggleFavorite,
                              child: Container(
                                width: 46,
                                height: 46,
                                decoration: BoxDecoration(
                                  color: _isLiked ? const Color(0xFF67D930).withValues(alpha: 0.2) : const Color(0xFF0C1210),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: const Color(0xFF67D930).withValues(alpha: 0.6), width: 1.5),
                                ),
                                child: Icon(
                                  _isLiked ? Icons.favorite : Icons.favorite_border,
                                  color: _isLiked ? const Color(0xFF67D930) : Colors.white70,
                                  size: 20,
                                ),
                              ),
                            ),
                          ],
                        ),
                        // Option 2: "Powered by CurseForge" badge.
                        // Tapping opens CurseForge site — gives them brand traffic.
                        // Shown on every mod detail page automatically.
                        const SizedBox(height: 12),
                        GestureDetector(
                          onTap: () => _launchUrl('https://www.curseforge.com'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0C1210),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: const Color(0xFF67D930).withValues(alpha: 0.45),
                                width: 1,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.bolt, color: Color(0xFF67D930), size: 13),
                                const SizedBox(width: 5),
                                Text(
                                  'Powered by CurseForge',
                                  style: TextStyle(
                                    color: const Color(0xFF67D930).withValues(alpha: 0.80),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text('Description', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                        Text(
                          _details!.summary,
                          style: const TextStyle(color: Colors.white70, fontSize: 16, height: 1.5),
                        ),
                        if (_details!.category == 'shaders') ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFF67D930).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF67D930).withValues(alpha: 0.3)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '📌 Compatible with: ${_details!.gameVersions.isNotEmpty ? _details!.gameVersions.join(', ') : 'All versions'}',
                                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 32),
                        const BannerAdWidget(),
                        if (_similarResources.isNotEmpty) ...[
                          const SizedBox(height: 32),
                          Text(
                            'Similar ${_details!.category == "shaders" ? "Shaders" : _details!.category == "textures" ? "Texture Packs" : "Mods"}',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 16),
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _similarResources.length,
                            itemBuilder: (context, index) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 24.0),
                                child: HorizontalResourceCard(resource: _similarResources[index]),
                              );
                            },
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                  // FIX 6: Show download button only if distribution is allowed.
                  // When downloadUrl is null the mod has allowModDistribution=false.
                  Positioned(
                    left: 20,
                    right: 20,
                    bottom: 24,
                    child: _details?.downloadUrl != null
                        ? _buildFloatingButton()
                        : Container(
                            height: 56,
                            decoration: BoxDecoration(
                              color: Colors.white10,
                              borderRadius: BorderRadius.circular(40),
                              border: Border.all(color: Colors.white24),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.block, color: Colors.white38, size: 18),
                                SizedBox(width: 8),
                                Text(
                                  'Not available for direct download',
                                  style: TextStyle(color: Colors.white38, fontSize: 14),
                                ),
                              ],
                            ),
                          ),
                  ),
                ],
              ),
    );
  }

  Widget _buildFloatingButton() {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        // 3D shadow layer behind button
        Positioned(
          left: 8, right: 8, top: 8,
          child: Container(
            height: 56,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(40),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.55),
                  blurRadius: 24,
                  spreadRadius: 2,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
          ),
        ),
        // Button body
        ClipRRect(
          borderRadius: BorderRadius.circular(40),
          child: _downloadedFilePath != null
              ? GestureDetector(
                  onTap: () async {
                    final path = _downloadedFilePath!;
                    String? mimeType;
                    if (path.endsWith('.mcworld')) mimeType = 'application/octet-stream';
                    else if (path.endsWith('.mcpack')) mimeType = 'application/octet-stream';
                    else if (path.endsWith('.mcaddon')) mimeType = 'application/octet-stream';
                    else if (path.endsWith('.zip')) mimeType = 'application/zip';
                    else if (path.endsWith('.jar')) mimeType = 'application/java-archive';
                    final result = await OpenFilex.open(path, type: mimeType);
                    if (result.type != ResultType.done && mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Could not open file. Make sure Minecraft is installed. Error: ${result.message}')),
                      );
                    }
                  },
                  child: Container(
                    height: 56,
                    decoration: const BoxDecoration(
                      color: Color(0xFF67d930),
                      borderRadius: BorderRadius.all(Radius.circular(40)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.open_in_new, color: Colors.black),
                        SizedBox(width: 8),
                        Text('Open with Minecraft', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.black)),
                      ],
                    ),
                  ),
                )
              : GestureDetector(
                  onTap: _isDownloading ? null : () {
                    final url = _details!.downloadUrl!;
                    String ext = '.mcpack';
                    if (url.contains('.mcworld')) ext = '.mcworld';
                    else if (url.contains('.mcaddon')) ext = '.mcaddon';
                    else if (url.contains('.mcpack')) ext = '.mcpack';
                    else if (url.contains('.jar')) ext = '.jar';
                    else if (url.contains('.zip')) ext = '.zip';
                    final safeName = _details!.name.replaceAll(RegExp(r'[^a-zA-Z0-9]'), '_');
                    _downloadFile(url, '$safeName$ext');
                  },
                  child: Container(
                    height: 56,
                    decoration: BoxDecoration(
                      color: _isDownloading ? const Color(0xFF67d930).withValues(alpha: 0.6) : const Color(0xFF67d930),
                      borderRadius: const BorderRadius.all(Radius.circular(40)),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        if (_isDownloading)
                          Positioned.fill(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(40),
                              child: LinearProgressIndicator(
                                // null = indeterminate (Content-Length unknown)
                                // double = real progress from server
                                value: _downloadProgress,
                                backgroundColor: Colors.transparent,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.green[800]!),
                              ),
                            ),
                          ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (!_isDownloading) const Icon(Icons.download, color: Colors.black),
                            if (!_isDownloading) const SizedBox(width: 8),
                            Text(
                              _isDownloading
                                  ? (_downloadProgress != null
                                      ? 'Downloading... ${(_downloadProgress! * 100).toInt()}%'
                                      : 'Downloading...')
                                  : 'Download',
                              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.black),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
        ),
      ],
    );
  }
}
