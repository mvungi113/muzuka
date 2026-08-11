class Artist {
  final String id;
  final String name;
  final String slug;
  final String? biography;
  final String? imagePath;
  final String? coverPath;
  final int songCount;
  final int albumCount;
  final int followerCount;

  Artist({
    required this.id,
    required this.name,
    required this.slug,
    this.biography,
    this.imagePath,
    this.coverPath,
    this.songCount = 0,
    this.albumCount = 0,
    this.followerCount = 0,
  });

  factory Artist.fromJson(Map<String, dynamic> json) => Artist(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        slug: json['slug'] ?? '',
        biography: json['biography'],
        imagePath: json['imagePath'],
        coverPath: json['coverPath'],
        songCount: json['_count']?['songs'] ?? json['songCount'] ?? 0,
        albumCount: json['_count']?['albums'] ?? json['albumCount'] ?? 0,
        followerCount: json['_count']?['followers'] ?? json['followerCount'] ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'slug': slug,
        'biography': biography,
        'imagePath': imagePath,
        'coverPath': coverPath,
      };
}
