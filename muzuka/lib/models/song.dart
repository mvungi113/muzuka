import 'artist.dart';
import 'album.dart';

class Song {
  final String id;
  final String title;
  final String slug;
  final String? description;
  final String? audioPath;
  final String? coverPath;
  final int? duration;
  final int? bitrate;
  final String? format;
  final int? fileSize;
  final DateTime? releaseDate;
  final String status;
  final int playCount;
  final DateTime createdAt;
  final String artistId;
  final String? albumId;
  final String? genreId;
  final ArtistRef? artist;
  final AlbumRef? album;
  final GenreRef? genre;
  final List<MoodRef> moods;
  final int? likeCount;

  Song({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    this.audioPath,
    this.coverPath,
    this.duration,
    this.bitrate,
    this.format,
    this.fileSize,
    this.releaseDate,
    required this.status,
    required this.playCount,
    required this.createdAt,
    required this.artistId,
    this.albumId,
    this.genreId,
    this.artist,
    this.album,
    this.genre,
    this.moods = const [],
    this.likeCount,
  });

  factory Song.fromJson(Map<String, dynamic> json) => Song(
        id: json['id'] ?? '',
        title: json['title'] ?? '',
        slug: json['slug'] ?? '',
        description: json['description'],
        audioPath: json['audioPath'],
        coverPath: json['coverPath'],
        duration: json['duration'],
        bitrate: json['bitrate'],
        format: json['format'],
        fileSize: json['fileSize'],
        releaseDate: json['releaseDate'] != null
            ? DateTime.tryParse(json['releaseDate'])
            : null,
        status: json['status'] ?? 'DRAFT',
        playCount: json['playCount'] ?? 0,
        createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
        artistId: json['artistId'] ?? '',
        albumId: json['albumId'],
        genreId: json['genreId'],
        artist: json['artist'] != null ? ArtistRef.fromJson(json['artist']) : null,
        album: json['album'] != null ? AlbumRef.fromJson(json['album']) : null,
        genre: json['genre'] != null ? GenreRef.fromJson(json['genre']) : null,
        moods: (json['songMoods'] as List?)
                ?.map((e) => MoodRef.fromJson(e['mood'] ?? e))
                .toList() ??
            [],
        likeCount: json['_count']?['songLikes'],
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'slug': slug,
        'description': description,
        'audioPath': audioPath,
        'coverPath': coverPath,
        'duration': duration,
        'status': status,
        'playCount': playCount,
        'artistId': artistId,
        'albumId': albumId,
        'genreId': genreId,
      };

  String? get durationFormatted {
    if (duration == null) return null;
    final minutes = (duration! / 60).floor();
    final seconds = duration! % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }
}

class AlbumRef {
  final String id;
  final String title;
  final String slug;
  final String? coverPath;

  AlbumRef({
    required this.id,
    required this.title,
    required this.slug,
    this.coverPath,
  });

  factory AlbumRef.fromJson(Map<String, dynamic> json) => AlbumRef(
        id: json['id'] ?? '',
        title: json['title'] ?? '',
        slug: json['slug'] ?? '',
        coverPath: json['coverPath'],
      );
}

class GenreRef {
  final String id;
  final String name;
  final String slug;

  GenreRef({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory GenreRef.fromJson(Map<String, dynamic> json) => GenreRef(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        slug: json['slug'] ?? '',
      );
}

class MoodRef {
  final String id;
  final String name;
  final String slug;
  final String? color;

  MoodRef({
    required this.id,
    required this.name,
    required this.slug,
    this.color,
  });

  factory MoodRef.fromJson(Map<String, dynamic> json) => MoodRef(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        slug: json['slug'] ?? '',
        color: json['color'],
      );
}
