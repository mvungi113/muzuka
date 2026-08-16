import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/artist.dart';
import '../models/song.dart';
import '../models/album.dart';
import '../services/api_client.dart';
import '../providers/player_provider.dart';
import '../widgets/song_cover.dart';

class ArtistDetailScreen extends ConsumerStatefulWidget {
  final String id;

  const ArtistDetailScreen({super.key, required this.id});

  @override
  ConsumerState<ArtistDetailScreen> createState() => _ArtistDetailScreenState();
}

class _ArtistDetailScreenState extends ConsumerState<ArtistDetailScreen> {
  Artist? _artist;
  bool _isLoading = true;
  bool _isFollowing = false;

  @override
  void initState() {
    super.initState();
    _loadArtist();
  }

  Future<void> _loadArtist() async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.artists}/${widget.id}',
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (!mounted) return;
      if (response.success && response.data != null) {
        setState(() {
          _artist = Artist.fromJson(response.data!);
          _isFollowing = response.data!['isFollowing'] ?? false;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleFollow() async {
    try {
      if (_isFollowing) {
        await apiClient.delete(ApiConstants.follow(widget.id));
      } else {
        await apiClient.post(ApiConstants.follow(widget.id));
      }
      if (mounted) setState(() => _isFollowing = !_isFollowing);
      _loadArtist();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));
    }

    final artist = _artist;
    if (artist == null) {
      return Scaffold(body: Center(child: Text('Artist not found', style: TextStyle(color: AppColors.textTertiary))));
    }

    final songs = (artist as dynamic).songs as List? ?? [];
    final albums = (artist as dynamic).albums as List? ?? [];

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilledButton.tonal(
                  onPressed: _toggleFollow,
                  style: FilledButton.styleFrom(
                    backgroundColor: _isFollowing ? AppColors.primary : AppColors.surfaceLight,
                    foregroundColor: _isFollowing ? Colors.white : AppColors.textPrimary,
                  ),
                  child: Text(_isFollowing ? 'Following' : 'Follow'),
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              title: Text(artist.name, style: const TextStyle(fontWeight: FontWeight.bold)),
              background: artist.coverPath != null
                  ? SongCover(path: artist.coverPath, size: double.infinity, borderRadius: 0, bucket: 'artist-images')
                  : Container(
                      decoration: BoxDecoration(gradient: AppColors.primaryGradient),
                      child: Center(
                        child: Text(
                          artist.name[0].toUpperCase(),
                          style: const TextStyle(fontSize: 80, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${artist.songCount} songs · ${artist.albumCount} albums · ${artist.followerCount} followers',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                  if (artist.biography != null) ...[
                    const SizedBox(height: 16),
                    Text(artist.biography!, style: const TextStyle(color: AppColors.textSecondary), maxLines: 3, overflow: TextOverflow.ellipsis),
                  ],
                  const SizedBox(height: 24),
                  const Text('Songs', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                ],
              ),
            ),
          ),
          if (songs.isNotEmpty)
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final song = songs[index];
                  final songData = song is Map<String, dynamic> ? Song.fromJson(song) : song;
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                    leading: SongCover(path: songData.coverPath, size: 48),
                    title: Text(songData.title, style: const TextStyle(color: AppColors.textPrimary)),
                    subtitle: Text(songData.durationFormatted ?? '', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    onTap: () {
                      final parsedSongs = songs.map<Song>((s) => s is Map<String, dynamic> ? Song.fromJson(s) : s).toList();
                      ref.read(playerProvider.notifier).playSong(songData, queue: parsedSongs, index: index);
                      context.push('/now-playing');
                    },
                  );
                },
                childCount: songs.length,
              ),
            ),
          if (albums.isNotEmpty) ...[
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 24, 20, 12),
                child: Text('Albums', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              ),
            ),
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final album = albums[index];
                  final albumData = album is Map<String, dynamic> ? Album.fromJson(album) : album;
                  return ListTile(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                    leading: SongCover(path: albumData.coverPath, size: 48),
                    title: Text(albumData.title, style: const TextStyle(color: AppColors.textPrimary)),
                    onTap: () => context.push('/album/${albumData.id}'),
                  );
                },
                childCount: albums.length,
              ),
            ),
          ],
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }
}
