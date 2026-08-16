import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../providers/player_provider.dart';
import '../widgets/song_cover.dart';

class RecentlyPlayedScreen extends ConsumerStatefulWidget {
  const RecentlyPlayedScreen({super.key});

  @override
  ConsumerState<RecentlyPlayedScreen> createState() => _RecentlyPlayedScreenState();
}

class _RecentlyPlayedScreenState extends ConsumerState<RecentlyPlayedScreen> {
  List<Song> _songs = [];
  bool _isLoading = true;
  int _page = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadSongs();
  }

  Future<void> _loadSongs() async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.recentlyPlayed}?page=$_page&limit=20',
        fromJson: (json) => json,
      );
      if (!mounted) return;
      if (response.success && response.data != null) {
        final data = response.data!;
        final items = (data['data'] as List).map((e) => Song.fromJson(e)).toList();
        final totalPages = data['pagination']['totalPages'] ?? 1;
        setState(() {
          if (_page == 1) {
            _songs = items;
          } else {
            _songs = [..._songs, ...items];
          }
          _hasMore = _page < totalPages;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recently Played'),
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _songs.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.history, size: 64, color: AppColors.textTertiary),
                      SizedBox(height: 16),
                      Text('No recently played songs', style: TextStyle(color: AppColors.textTertiary, fontSize: 16)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.only(bottom: 100),
                  itemCount: _songs.length + (_hasMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _songs.length) {
                      _page++;
                      _loadSongs();
                      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
                    }
                    final song = _songs[index];
                    return ListTile(
                      leading: SongCover(path: song.coverPath, size: 48, borderRadius: 4),
                      title: Text(song.title, style: const TextStyle(color: AppColors.textPrimary)),
                      subtitle: Text(song.artist?.name ?? '', style: const TextStyle(color: AppColors.textSecondary)),
                      trailing: Text(
                        song.duration != null ? '${(song.duration! ~/ 60)}:${(song.duration! % 60).toString().padLeft(2, '0')}' : '',
                        style: const TextStyle(color: AppColors.textTertiary, fontSize: 12),
                      ),
                      onTap: () {
                        ref.read(playerProvider.notifier).playSong(song, queue: _songs, index: index);
                        context.push('/now-playing');
                      },
                    );
                  },
                ),
    );
  }
}
