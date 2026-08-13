import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../providers/player_provider.dart';
import '../providers/playlists_provider.dart';
import '../widgets/song_cover.dart';

class PlaylistDetailScreen extends ConsumerStatefulWidget {
  final String playlistId;

  const PlaylistDetailScreen({super.key, required this.playlistId});

  @override
  ConsumerState<PlaylistDetailScreen> createState() => _PlaylistDetailScreenState();
}

class _PlaylistDetailScreenState extends ConsumerState<PlaylistDetailScreen> {
  Map<String, dynamic>? _playlist;
  List<Song> _songs = [];
  bool _isLoading = true;
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    _loadPlaylist();
  }

  Future<void> _loadPlaylist() async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        ApiConstants.playlist(widget.playlistId),
        fromJson: (json) => json,
      );
      if (response.success && response.data != null && mounted) {
        final data = response.data!;
        setState(() {
          _playlist = data;
          _songs = (data['playlistSongs'] as List?)
                  ?.map((ps) => Song.fromJson(ps['song']))
                  .toList() ??
              [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _removeSong(String songId) async {
    final success = await ref
        .read(playlistsProvider.notifier)
        .removeSong(widget.playlistId, songId);
    if (success && mounted) {
      setState(() => _songs.removeWhere((s) => s.id == songId));
    }
  }

  Future<void> _reorder(int oldIndex, int newIndex) async {
    if (oldIndex < newIndex) newIndex--;
    final item = _songs.removeAt(oldIndex);
    _songs.insert(newIndex, item);

    try {
      await apiClient.put(
        '${ApiConstants.playlist(widget.playlistId)}/songs/reorder',
        body: {'songIds': _songs.map((s) => s.id).toList()},
      );
    } catch (_) {}
    setState(() {});
  }

  void _showRenameDialog() {
    final controller = TextEditingController(text: _playlist?['name'] ?? '');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Rename Playlist', style: TextStyle(color: AppColors.textPrimary)),
        content: TextField(
          controller: controller,
          autofocus: true,
          style: const TextStyle(color: AppColors.textPrimary),
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.surfaceLight,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textTertiary)),
          ),
          TextButton(
            onPressed: () async {
              if (controller.text.trim().isNotEmpty) {
                await apiClient.patch(
                  ApiConstants.playlist(widget.playlistId),
                  body: {'name': controller.text.trim()},
                );
                if (context.mounted) {
                  Navigator.pop(context);
                  _loadPlaylist();
                }
              }
            },
            child: const Text('Save', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_playlist?['name'] ?? 'Playlist'),
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.check : Icons.edit),
            onPressed: () {
              if (_isEditing) {
                _reorder(0, 0);
              }
              setState(() => _isEditing = !_isEditing);
            },
          ),
          PopupMenuButton(
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'rename', child: Text('Rename')),
              const PopupMenuItem(value: 'delete', child: Text('Delete')),
            ],
            onSelected: (value) {
              if (value == 'rename') _showRenameDialog();
              if (value == 'delete') {
                ref.read(playlistsProvider.notifier).delete(widget.playlistId);
                context.pop();
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _songs.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.queue_music, size: 64, color: AppColors.textTertiary),
                      SizedBox(height: 16),
                      Text('No songs yet', style: TextStyle(color: AppColors.textTertiary, fontSize: 16)),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            ref.read(playerProvider.notifier).playSong(_songs.first, queue: _songs, index: 0);
                            context.push('/now-playing');
                          },
                          icon: const Icon(Icons.play_arrow, color: Colors.white),
                          label: const Text('Play All', style: TextStyle(color: Colors.white)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: ReorderableListView.builder(
                        onReorder: _isEditing ? _reorder : (a, b) {},
                        itemCount: _songs.length,
                        itemBuilder: (context, index) {
                          final song = _songs[index];
                          return ListTile(
                            key: ValueKey(song.id),
                            leading: _isEditing
                                ? const Icon(Icons.drag_handle, color: AppColors.textTertiary)
                                : Text('${index + 1}', style: const TextStyle(color: AppColors.textTertiary)),
                            title: Text(song.title, style: const TextStyle(color: AppColors.textPrimary)),
                            subtitle: Text(song.artist?.name ?? '', style: const TextStyle(color: AppColors.textSecondary)),
                            trailing: _isEditing
                                ? IconButton(
                                    icon: const Icon(Icons.remove_circle_outline, color: AppColors.error),
                                    onPressed: () => _removeSong(song.id),
                                  )
                                : Text(
                                    song.duration != null ? '${(song.duration! ~/ 60)}:${(song.duration! % 60).toString().padLeft(2, '0')}' : '',
                                    style: const TextStyle(color: AppColors.textTertiary, fontSize: 12),
                                  ),
                            onTap: _isEditing
                                ? null
                                : () {
                                    ref.read(playerProvider.notifier).playSong(song, queue: _songs, index: index);
                                    context.push('/now-playing');
                                  },
                          );
                        },
                      ),
                    ),
                  ],
                ),
    );
  }
}
