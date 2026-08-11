class Album {
  final String id;
  final String title;
  final String slug;
  final String? description;
  final String? coverPath;
  final DateTime? releaseDate;
  final String status;
  final String artistId;
  final String? artistName;
  final ArtistRef? artist;
  final int songCount;
  final int likeCount;

  Album({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    this.coverPath,
    this.releaseDate,
    required this.status,
    required this.artistId,
    this.artistName,
    this.artist,
    this.songCount = 0,
    this.likeCount = 0,
  });

  factory Album.fromJson(Map<String, dynamic> json) => Album(
        id: json['id'] ?? '',
        title: json['title'] ?? '',
        slug: json['slug'] ?? '',
        description: json['description'],
        coverPath: json['coverPath'],
        releaseDate: json['releaseDate'] != null
            ? DateTime.tryParse(json['releaseDate'])
            : null,
        status: json['status'] ?? 'DRAFT',
        artistId: json['artistId'] ?? '',
        artistName: json['artist']?['name'],
        artist: json['artist'] != null ? ArtistRef.fromJson(json['artist']) : null,
        songCount: json['_count']?['songs'] ?? json['songCount'] ?? 0,
        likeCount: json['_count']?['albumLikes'] ?? json['likeCount'] ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'slug': slug,
        'description': description,
        'coverPath': coverPath,
        'releaseDate': releaseDate?.toIso8601String(),
        'status': status,
        'artistId': artistId,
      };
}

class ArtistRef {
  final String id;
  final String name;
  final String slug;
  final String? imagePath;

  ArtistRef({
    required this.id,
    required this.name,
    required this.slug,
    this.imagePath,
  });

  factory ArtistRef.fromJson(Map<String, dynamic> json) => ArtistRef(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        slug: json['slug'] ?? '',
        imagePath: json['imagePath'],
      );
}
