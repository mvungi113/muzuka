import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../providers/player_provider.dart';
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
      if (response.success && response.data != null) {
        setState(() {
          _song = Song.fromJson(response.data!);
          _isLoading = false;
        });
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    final song = _song;
    if (song == null) {
      return Scaffold(
        body: Center(child: Text('Song not found', style: TextStyle(color: AppColors.textTertiary))),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(song.title),
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
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => context.push('/artist/${song.artistId}'),
              child: Text(
                song.artist?.name ?? '',
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.primary,
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () {
                  ref.read(playerProvider.notifier).play(song);
                },
                icon: const Icon(Icons.play_arrow, color: Colors.white),
                label: const Text(
                  'Play',
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(26),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            if (song.description != null && song.description!.isNotEmpty) ...[
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'About',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                song.description!,
                style: const TextStyle(color: AppColors.textSecondary),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
