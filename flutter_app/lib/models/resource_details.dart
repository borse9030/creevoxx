class ResourceDetails {
  final int id;
  final String name;
  final String summary;
  final String category;
  final String? logoUrl;
  final List<String> authorNames;
  final int? downloadCount;
  final String? dateCreated;
  final String? dateModified;
  final String? descriptionHtml;
  final List<String> screenshotUrls;
  final List<String> gameVersions;
  final List<String> modLoaders;
  final String? downloadUrl;
  final String? fileSize;

  ResourceDetails({
    required this.id,
    required this.name,
    required this.summary,
    required this.category,
    this.logoUrl,
    required this.authorNames,
    this.downloadCount,
    this.dateCreated,
    this.dateModified,
    this.descriptionHtml,
    required this.screenshotUrls,
    required this.gameVersions,
    required this.modLoaders,
    this.downloadUrl,
    this.fileSize,
  });

  factory ResourceDetails.fromJson(Map<String, dynamic> json) {
    List<String> authors = [];
    if (json['authors'] != null && json['authors'] is List) {
      for (var a in json['authors']) {
        if (a['name'] != null) authors.add(a['name'].toString());
      }
    }

    List<String> finalScreenshots = [];
    String? logo = json['logoUrl']?.toString();
    if (logo != null) {
      finalScreenshots.add(logo);
    }

    String? descHtml = json['descriptionHtml'];
    List<String> htmlImages = [];
    if (descHtml != null) {
      final imgRegex = RegExp(r'<img[^>]+src="([^">]+)"');
      final matches = imgRegex.allMatches(descHtml);
      for (final match in matches) {
        if (match.groupCount >= 1) {
          final url = match.group(1);
          if (url != null && !url.contains('img.shields.io') && !url.contains('discordapp') && !finalScreenshots.contains(url) && !htmlImages.contains(url)) {
            htmlImages.add(url);
          }
        }
      }
      descHtml = descHtml.replaceAll(RegExp(r'<img[^>]*>'), '');
      descHtml = descHtml.replaceAll(RegExp(r'<iframe[^>]*>.*?<\/iframe>', caseSensitive: false, dotAll: true), '');
      descHtml = descHtml.replaceAll('\n', '<br>');
    }

    if (htmlImages.isNotEmpty) {
      finalScreenshots.addAll(htmlImages);
    } else {
      if (json['screenshots'] != null && json['screenshots'] is List) {
        for (var s in json['screenshots']) {
          if (s['url'] != null && !finalScreenshots.contains(s['url'].toString())) {
            finalScreenshots.add(s['url'].toString());
          }
        }
      }
    }

    return ResourceDetails(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      summary: json['summary'] ?? '',
      category: json['category'] ?? '',
      logoUrl: logo,
      authorNames: authors,
      downloadCount: json['downloadCount'],
      dateCreated: json['dateCreated'],
      dateModified: json['dateModified'],
      descriptionHtml: descHtml,
      screenshotUrls: finalScreenshots,
      gameVersions: json['gameVersions'] != null ? List<String>.from(json['gameVersions']) : [],
      modLoaders: json['modLoaders'] != null ? List<String>.from(json['modLoaders']) : [],
      downloadUrl: json['downloadUrl'],
      fileSize: json['fileSize'],
    );
  }
}
