import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/player_provider.dart';
import '../../widgets/song_cover.dart';

class NowPlayingScreen extends ConsumerWidget {
  const NowPlayingScreen({super.key});

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
                      onPressed: () {},
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
                        Icons.favorite_border,
                        color: AppColors.textPrimary,
                      ),
                      onPressed: () {
                        // TODO: Like song
                      },
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
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: const Icon(Icons.download, color: AppColors.textTertiary),
                      onPressed: () {},
                    ),
                    IconButton(
                      icon: const Icon(Icons.playlist_add, color: AppColors.textTertiary),
                      onPressed: () {},
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
