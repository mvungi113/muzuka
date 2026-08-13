import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/album.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../providers/player_provider.dart';
import '../widgets/song_cover.dart';

class AlbumDetailScreen extends ConsumerStatefulWidget {
  final String id;

  const AlbumDetailScreen({super.key, required this.id});

  @override
  ConsumerState<AlbumDetailScreen> createState() => _AlbumDetailScreenState();
}

class _AlbumDetailScreenState extends ConsumerState<AlbumDetailScreen> {
  Album? _album;
  List<Song> _songs = [];
  bool _isLoading = true;
  bool _isLiked = false;

  @override
  void initState() {
    super.initState();
    _loadAlbum();
  }

  Future<void> _loadAlbum() async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.albums}/${widget.id}',
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (response.success && response.data != null) {
        final data = response.data!;
        setState(() {
          _album = Album.fromJson(data);
          _songs = (data['songs'] as List?)?.map((e) => Song.fromJson(e)).toList() ?? [];
          _isLiked = data['isLiked'] ?? false;
          _isLoading = false;
        });
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleLike() async {
    try {
      if (_isLiked) {
        await apiClient.delete(ApiConstants.albumLike(widget.id));
      } else {
        await apiClient.post(ApiConstants.albumLike(widget.id));
      }
      setState(() => _isLiked = !_isLiked);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));
    }

    final album = _album;
    if (album == null) {
      return Scaffold(body: Center(child: Text('Album not found', style: TextStyle(color: AppColors.textTertiary))));
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            actions: [
              IconButton(
                icon: Icon(
                  _isLiked ? Icons.favorite : Icons.favorite_border,
                  color: _isLiked ? AppColors.primary : AppColors.textPrimary,
                ),
                onPressed: _toggleLike,
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              title: Text(album.title, style: const TextStyle(fontWeight: FontWeight.bold)),
              background: SongCover(path: album.coverPath, size: double.infinity, borderRadius: 0),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(album.artistName ?? '', style: const TextStyle(color: AppColors.primary, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text(
                    '${_songs.length} songs · ${album.releaseDate != null ? '${album.releaseDate!.year}' : 'Unknown year'}',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      onPressed: _songs.isNotEmpty
                          ? () => ref.read(playerProvider.notifier).playSong(_songs.first, queue: _songs, index: 0)
                          : null,
                      icon: const Icon(Icons.play_arrow, color: Colors.white),
                      label: const Text('Play', style: TextStyle(color: Colors.white)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final song = _songs[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                  leading: Text('${index + 1}', style: const TextStyle(color: AppColors.textTertiary, fontSize: 14)),
                  title: Text(song.title, style: const TextStyle(color: AppColors.textPrimary)),
                  subtitle: Text(song.durationFormatted ?? '', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  trailing: Text('${song.playCount} plays', style: const TextStyle(color: AppColors.textTertiary, fontSize: 12)),
                  onTap: () {
                    ref.read(playerProvider.notifier).playSong(song, queue: _songs, index: index);
                    context.push('/now-playing');
                  },
                );
              },
              childCount: _songs.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }
}
