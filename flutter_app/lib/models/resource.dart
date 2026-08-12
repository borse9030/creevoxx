// Custom thumbnail overrides — applied on every Resource regardless of source (live API or cache).
// Key: lowercase keyword that the shader title contains.
// Value: public URL on our own CDN (Vercel /public/thumbnails/).
const Map<String, String> _customThumbnails = {
  'newb x dawn':       'https://creevoxx.dev/thumbnails/newb_x_dawn.webp',
  'newb x stars':      'https://creevoxx.dev/thumbnails/newb_x_stars.webp',
  'newb x unwind':     'https://creevoxx.dev/thumbnails/newb_x_unwind.webp',
  'newb x flamingo':   'https://creevoxx.dev/thumbnails/newb_x_flamingo.webp',
  'newb x sapphire':   'https://creevoxx.dev/thumbnails/newb_x_sapphire.webp',
  'newb x legacy':     'https://creevoxx.dev/thumbnails/newb_x_legacy.webp',
  'newb x dragon':     'https://creevoxx.dev/thumbnails/newb_x_dragon.webp',
  'newb x ale':        'https://creevoxx.dev/thumbnails/newb_x_ale.webp',
  'newb x apocalipsis':'https://creevoxx.dev/thumbnails/newb_x_apocalipsis.webp',
  // Render Dragon Shaders
  'lunac shaders 3d':  'https://creevoxx.dev/thumbnails/lunac_shaders_3d.webp',
  'lemo visuals':      'https://creevoxx.dev/thumbnails/lemo_visuals.webp',
  'rg shader':         'https://creevoxx.dev/thumbnails/rg_shader.webp',
  'luminous dreams':   'https://creevoxx.dev/thumbnails/luminous_dreams.webp',
  'bslb shaders':      'https://creevoxx.dev/thumbnails/bslb_shaders.webp',
  'pastel shaders':    'https://creevoxx.dev/thumbnails/pastel_shaders.webp',
  'r135 shader':       'https://creevoxx.dev/thumbnails/r135_shader.webp',
  // Vibrant Visuals Shaders
  'sildur\'s vibrant':        'https://creevoxx.dev/thumbnails/sildurs_vibrant_shaders.webp',
  'prizma visuals legacy':    'https://creevoxx.dev/thumbnails/prizma_visuals_legacy.webp',
  'revolution vibrant':       'https://creevoxx.dev/thumbnails/revolution_vibrant_visuals.webp',
  'definitive vibrant':       'https://creevoxx.dev/thumbnails/definitive_vibrant_visuals.webp',
  'better vibrant':           'https://creevoxx.dev/thumbnails/better_vibrant_visuals.webp',
  'odyssey visuals':          'https://creevoxx.dev/thumbnails/odyssey_visuals.webp',
  'solace v':                 'https://creevoxx.dev/thumbnails/solace_v.webp',
  'dreamy visuals':           'https://creevoxx.dev/thumbnails/dreamy_visuals.webp',
};

/// Returns the custom thumbnail URL if the [title] matches any override,
/// otherwise returns [fallback] (the original CurseForge URL).
String _resolveThumbnail(String title, String fallback) {
  final lower = title.toLowerCase();
  for (final entry in _customThumbnails.entries) {
    if (lower.contains(entry.key)) return entry.value;
  }
  return fallback;
}

class Resource {
  final String id;
  final String docId;
  final int curseforgeId;
  final String title;
  final String description;
  final String category;
  final String version;
  final String thumbnailUrl;
  final String author;
  final int downloadCount;
  final String dateModified;
  final List<String> tags;

  Resource({
    required this.id,
    required this.docId,
    required this.curseforgeId,
    required this.title,
    required this.description,
    required this.category,
    required this.version,
    required this.thumbnailUrl,
    required this.author,
    required this.downloadCount,
    required this.dateModified,
    required this.tags,
  });

  factory Resource.fromJson(Map<String, dynamic> json) {
    final title = json['title']?.toString() ?? '';
    final rawThumbnail = json['thumbnail_url']?.toString() ?? '';
    return Resource(
      id: json['id']?.toString() ?? '',
      docId: json['docId']?.toString() ?? '',
      curseforgeId: json['curseforge_id'] is int ? json['curseforge_id'] : int.tryParse(json['curseforge_id']?.toString() ?? '0') ?? 0,
      title: title,
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      version: json['version']?.toString() ?? '',
      // Override thumbnail if this is one of our custom shaders
      thumbnailUrl: _resolveThumbnail(title, rawThumbnail),
      author: json['author']?.toString() ?? '',
      downloadCount: json['download_count'] is int ? json['download_count'] : int.tryParse(json['download_count']?.toString() ?? '0') ?? 0,
      dateModified: json['dateModified']?.toString() ?? '',
      tags: json['tags'] != null ? List<String>.from(json['tags']) : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'docId': docId,
      'curseforge_id': curseforgeId,
      'title': title,
      'description': description,
      'category': category,
      'version': version,
      'thumbnail_url': thumbnailUrl,
      'author': author,
      'download_count': downloadCount,
      'dateModified': dateModified,
      'tags': tags,
    };
  }
}

