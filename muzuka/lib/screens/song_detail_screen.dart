import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../providers/player_provider.dart';
import '../providers/downloads_provider.dart';
import '../widgets/song_cover.dart';

class SongDetailScreen extends ConsumerStatefulWidget {
  final String id;

  const SongDetailScreen({super.key, required this.id});

  @override
  ConsumerState<SongDetailScreen> createState() => _SongDetailScreenState();
}

class _SongDetailScreenState extends ConsumerState<SongDetailScreen> {
  Song? _song;
  bool _isLoading = true;
  bool _isLiked = false;

  @override
  void initState() {
    super.initState();
    _loadSong();
  }

  Future<void> _loadSong() async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.songs}/${widget.id}',
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (response.success && response.data != null && mounted) {
        setState(() {
          _song = Song.fromJson(response.data!);
          _isLiked = response.data!['isLiked'] ?? false;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleLike() async {
    if (_song == null) return;
    try {
      if (_isLiked) {
        await apiClient.delete(ApiConstants.like(_song!.id));
      } else {
        await apiClient.post(ApiConstants.like(_song!.id));
      }
      if (mounted) setState(() => _isLiked = !_isLiked);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _showAddToPlaylist() {
    if (_song == null) return;
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => _AddToPlaylistSheet(songId: _song!.id),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));
    }

    final song = _song;
    if (song == null) {
      return Scaffold(body: Center(child: Text('Song not found', style: TextStyle(color: AppColors.textTertiary))));
    }

    final isDownloaded = ref.read(downloadsProvider.notifier).isDownloaded(song.id);

    return Scaffold(
      appBar: AppBar(
        title: Text(song.title),
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            SongCover(
              path: song.coverPath,
              size: MediaQuery.of(context).size.width * 0.7,
              borderRadius: 16,
            ),
            const SizedBox(height: 24),
            Text(
              song.title,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => context.push('/artist/${song.artistId}'),
              child: Text(
                song.artist?.name ?? '',
                style: const TextStyle(fontSize: 16, color: AppColors.primary),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: Icon(
                    _isLiked ? Icons.favorite : Icons.favorite_border,
                    color: _isLiked ? AppColors.primary : AppColors.textPrimary,
                    size: 28,
                  ),
                  onPressed: _toggleLike,
                ),
                const SizedBox(width: 16),
                IconButton(
                  icon: Icon(
                    isDownloaded ? Icons.download_done : Icons.download,
                    color: isDownloaded ? AppColors.primary : AppColors.textPrimary,
                    size: 28,
                  ),
                  onPressed: isDownloaded
                      ? null
                      : () async {
                          final success = await ref.read(downloadsProvider.notifier).download(song);
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(success ? 'Downloaded' : 'Download failed')),
                            );
                          }
                        },
                ),
                const SizedBox(width: 16),
                IconButton(
                  icon: const Icon(Icons.playlist_add, color: AppColors.textPrimary, size: 28),
                  onPressed: _showAddToPlaylist,
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () {
                  ref.read(playerProvider.notifier).play(song);
                  context.push('/now-playing');
                },
                icon: const Icon(Icons.play_arrow, color: Colors.white),
                label: const Text('Play', style: TextStyle(color: Colors.white, fontSize: 16)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                ),
              ),
            ),
            const SizedBox(height: 24),
            if (song.description != null && song.description!.isNotEmpty) ...[
              const Align(
                alignment: Alignment.centerLeft,
                child: Text('About', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              ),
              const SizedBox(height: 8),
              Text(song.description!, style: const TextStyle(color: AppColors.textSecondary)),
            ],
          ],
        ),
      ),
    );
  }
}

class _AddToPlaylistSheet extends StatefulWidget {
  final String songId;

  const _AddToPlaylistSheet({required this.songId});

  @override
  State<_AddToPlaylistSheet> createState() => _AddToPlaylistSheetState();
}

class _AddToPlaylistSheetState extends State<_AddToPlaylistSheet> {
  List<Map<String, dynamic>> _playlists = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPlaylists();
  }

  Future<void> _loadPlaylists() async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        ApiConstants.playlists,
        fromJson: (json) => json,
      );
      if (response.success && response.data != null && mounted) {
        setState(() {
          _playlists = List<Map<String, dynamic>>.from(response.data!['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _addToPlaylist(String playlistId) async {
    try {
      await apiClient.post(
        '${ApiConstants.playlist(playlistId)}/songs',
        body: {'songId': widget.songId},
      );
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Added to playlist')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.5,
      minChildSize: 0.3,
      maxChildSize: 0.8,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(top: 12),
                decoration: BoxDecoration(color: AppColors.textTertiary, borderRadius: BorderRadius.circular(2)),
              ),
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text('Add to Playlist', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              ),
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                    : _playlists.isEmpty
                        ? const Center(child: Text('No playlists yet', style: TextStyle(color: AppColors.textTertiary)))
                        : ListView.builder(
                            controller: scrollController,
                            itemCount: _playlists.length,
                            itemBuilder: (context, index) {
                              final playlist = _playlists[index];
                              return ListTile(
                                leading: const Icon(Icons.queue_music, color: AppColors.textPrimary),
                                title: Text(playlist['name'] ?? '', style: const TextStyle(color: AppColors.textPrimary)),
                                onTap: () => _addToPlaylist(playlist['id']),
                              );
                            },
                          ),
              ),
            ],
          ),
        );
      },
    );
  }
}
