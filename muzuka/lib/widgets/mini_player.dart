import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../providers/player_provider.dart';
import '../widgets/song_cover.dart';

class MiniPlayer extends ConsumerWidget {
  const MiniPlayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerState = ref.watch(playerProvider);
    final song = playerState.currentSong;

    if (song == null) return const SizedBox.shrink();

    return GestureDetector(
      onTap: () => context.push('/now-playing'),
      child: Container(
        height: 64,
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            // Progress bar
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: LinearProgressIndicator(
                value: playerState.duration.inMilliseconds > 0
                    ? playerState.position.inMilliseconds / playerState.duration.inMilliseconds
                    : 0.0,
                backgroundColor: AppColors.surfaceDark,
                valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                minHeight: 2,
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: [
                    SongCover(path: song.coverPath, size: 44),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            song.title,
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            song.artist?.name ?? '',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    if (playerState.isLoading)
                      const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.primary,
                        ),
                      )
                    else
                      IconButton(
                        icon: Icon(
                          playerState.isPlaying ? Icons.pause : Icons.play_arrow,
                          color: AppColors.textPrimary,
                        ),
                        onPressed: () => ref.read(playerProvider.notifier).togglePlay(),
                      ),
                    IconButton(
                      icon: const Icon(Icons.skip_next, color: AppColors.textPrimary),
                      onPressed: playerState.hasNext
                          ? () => ref.read(playerProvider.notifier).next()
                          : null,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
