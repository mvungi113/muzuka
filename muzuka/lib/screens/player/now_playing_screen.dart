import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/api_constants.dart';
import '../../providers/player_provider.dart';
import '../../services/api_client.dart';
import '../../widgets/song_cover.dart';

class NowPlayingScreen extends ConsumerStatefulWidget {
  const NowPlayingScreen({super.key});

  @override
  ConsumerState<NowPlayingScreen> createState() => _NowPlayingScreenState();
}

class _NowPlayingScreenState extends ConsumerState<NowPlayingScreen> {
  bool _isLiked = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _checkLiked();
  }

  Future<void> _checkLiked() async {
    final song = ref.read(playerProvider).currentSong;
    if (song == null) return;
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        ApiConstants.song(song.id),
        fromJson: (json) => json,
      );
      if (response.success && response.data != null && mounted) {
        setState(() => _isLiked = response.data!['isLiked'] ?? false);
      }
    } catch (_) {}
  }

  Future<void> _toggleLike() async {
    final song = ref.read(playerProvider).currentSong;
    if (song == null) return;
    try {
      if (_isLiked) {
        await apiClient.delete(ApiConstants.like(song.id));
      } else {
        await apiClient.post(ApiConstants.like(song.id));
      }
      setState(() => _isLiked = !_isLiked);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _showAddToPlaylist() {
    final song = ref.read(playerProvider).currentSong;
    if (song == null) return;
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => _AddToPlaylistSheet(songId: song.id),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final player = ref.watch(playerProvider);
    final song = player.currentSong;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.surfaceLight, AppColors.background],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.keyboard_arrow_down, size: 32),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Column(
                      children: [
                        const Text(
                          'Playing from',
                          style: TextStyle(color: AppColors.textTertiary, fontSize: 12),
                        ),
                        Text(
                          song?.album?.title ?? 'Queue',
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.more_vert),
                      onPressed: () {
                        showModalBottomSheet(
                          context: context,
                          backgroundColor: AppColors.surface,
                          shape: const RoundedRectangleBorder(
                            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                          ),
                          builder: (context) => SafeArea(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 40,
                                  height: 4,
                                  margin: const EdgeInsets.only(top: 12),
                                  decoration: BoxDecoration(color: AppColors.textTertiary, borderRadius: BorderRadius.circular(2)),
                                ),
                                ListTile(
                                  leading: const Icon(Icons.info_outline, color: AppColors.textPrimary),
                                  title: const Text('Song Info', style: TextStyle(color: AppColors.textPrimary)),
                                  onTap: () {
                                    Navigator.pop(context);
                                    if (song != null) context.push('/song/${song.id}');
                                  },
                                ),
                                ListTile(
                                  leading: const Icon(Icons.artist, color: AppColors.textPrimary),
                                  title: const Text('Go to Artist', style: TextStyle(color: AppColors.textPrimary)),
                                  onTap: () {
                                    Navigator.pop(context);
                                    if (song?.artistId != null) context.push('/artist/${song!.artistId}');
                                  },
                                ),
                                if (song?.albumId != null)
                                  ListTile(
                                    leading: const Icon(Icons.album, color: AppColors.textPrimary),
                                    title: const Text('Go to Album', style: TextStyle(color: AppColors.textPrimary)),
                                    onTap: () {
                                      Navigator.pop(context);
                                      context.push('/album/${song!.albumId}');
                                    },
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Album art
              if (song != null)
                SongCover(
                  path: song.coverPath,
                  size: MediaQuery.of(context).size.width * 0.75,
                  borderRadius: 16,
                )
              else
                Container(
                  width: MediaQuery.of(context).size.width * 0.75,
                  height: MediaQuery.of(context).size.width * 0.75,
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.music_note, color: Colors.white, size: 80),
                ),

              const Spacer(),

              // Song info
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            song?.title ?? 'No song playing',
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            song?.artist?.name ?? '',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 16,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        _isLiked ? Icons.favorite : Icons.favorite_border,
                        color: _isLiked ? AppColors.primary : AppColors.textPrimary,
                      ),
                      onPressed: _toggleLike,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Progress bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  children: [
                    SliderTheme(
                      data: SliderThemeData(
                        trackHeight: 4,
                        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                        overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
                        activeTrackColor: AppColors.textPrimary,
                        inactiveTrackColor: AppColors.surfaceLight,
                        thumbColor: AppColors.textPrimary,
                        overlayColor: AppColors.textPrimary.withOpacity(0.1),
                      ),
                      child: Slider(
                        value: player.duration.inMilliseconds > 0
                            ? player.position.inMilliseconds.toDouble().clamp(
                                0, player.duration.inMilliseconds.toDouble())
                            : 0,
                        max: player.duration.inMilliseconds > 0
                            ? player.duration.inMilliseconds.toDouble()
                            : 1,
                        onChanged: (value) {
                          ref.read(playerProvider.notifier).seek(
                                Duration(milliseconds: value.toInt()),
                              );
                        },
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _formatDuration(player.position),
                            style: const TextStyle(
                              color: AppColors.textTertiary,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            _formatDuration(player.duration),
                            style: const TextStyle(
                              color: AppColors.textTertiary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Controls
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: Icon(
                        Icons.shuffle,
                        color: player.shuffle ? AppColors.primary : AppColors.textTertiary,
                      ),
                      onPressed: () => ref.read(playerProvider.notifier).toggleShuffle(),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.skip_previous,
                        color: player.hasPrevious ? AppColors.textPrimary : AppColors.textTertiary,
                        size: 36,
                      ),
                      onPressed: player.hasPrevious
                          ? () => ref.read(playerProvider.notifier).previous()
                          : null,
                    ),
                    Container(
                      width: 64,
                      height: 64,
                      decoration: const BoxDecoration(
                        color: AppColors.textPrimary,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: player.isLoading
                            ? const SizedBox(
                                width: 28,
                                height: 28,
                                child: CircularProgressIndicator(
                                  strokeWidth: 3,
                                  color: AppColors.background,
                                ),
                              )
                            : Icon(
                                player.isPlaying ? Icons.pause : Icons.play_arrow,
                                color: AppColors.background,
                                size: 36,
                              ),
                        onPressed: player.isLoading
                            ? null
                            : () => ref.read(playerProvider.notifier).togglePlay(),
                      ),
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.skip_next,
                        color: player.hasNext ? AppColors.textPrimary : AppColors.textTertiary,
                        size: 36,
                      ),
                      onPressed: player.hasNext
                          ? () => ref.read(playerProvider.notifier).next()
                          : null,
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.repeat,
                        color: player.repeatMode != RepeatMode.off
                            ? AppColors.primary
                            : AppColors.textTertiary,
                      ),
                      onPressed: () => ref.read(playerProvider.notifier).cycleRepeat(),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Extra controls
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 48),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.share, color: AppColors.textTertiary),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Share coming soon')),
                        );
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.download, color: AppColors.textTertiary),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Download coming soon')),
                        );
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.playlist_add, color: AppColors.textTertiary),
                      onPressed: _showAddToPlaylist,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes;
    final seconds = duration.inSeconds % 60;
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
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
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
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
                decoration: BoxDecoration(
                  color: AppColors.textTertiary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const Padding(
                padding: EdgeInsets.all(16),
                child: Text(
                  'Add to Playlist',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ),
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                    : _playlists.isEmpty
                        ? const Center(
                            child: Text('No playlists yet', style: TextStyle(color: AppColors.textTertiary)),
                          )
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
