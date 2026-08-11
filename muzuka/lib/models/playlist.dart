import 'song.dart';

class Playlist {
  final String id;
  final String name;
  final String? description;
  final String? coverPath;
  final bool isPublic;
  final String userId;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Song> songs;
  final int songCount;

  Playlist({
    required this.id,
    required this.name,
    this.description,
    this.coverPath,
    required this.isPublic,
    required this.userId,
    required this.createdAt,
    required this.updatedAt,
    this.songs = const [],
    this.songCount = 0,
  });

  factory Playlist.fromJson(Map<String, dynamic> json) => Playlist(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        description: json['description'],
        coverPath: json['coverPath'],
        isPublic: json['isPublic'] ?? false,
        userId: json['userId'] ?? '',
        createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
        updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
        songs: (json['playlistSongs'] as List?)
                ?.map((e) => Song.fromJson(e['song'] ?? e))
                .toList() ??
            [],
        songCount: json['_count']?['playlistSongs'] ?? json['songCount'] ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'isPublic': isPublic,
      };
}
