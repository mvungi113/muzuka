import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../models/song.dart';
import '../providers/downloads_provider.dart';
import '../providers/player_provider.dart';
import '../widgets/song_cover.dart';

class DownloadsScreen extends ConsumerWidget {
  const DownloadsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(downloadsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Downloads'), backgroundColor: AppColors.background, foregroundColor: AppColors.textPrimary),
      body: state.isLoading
          ? Center(child: CircularProgressIndicator(color: AppColors.primary))
          : state.downloads.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.download_done, size: 64, color: AppColors.textTertiary),
                      const SizedBox(height: 16),
                      Text('No downloads yet', style: TextStyle(color: AppColors.textTertiary, fontSize: 16)),
                      const SizedBox(height: 8),
                      Text('Songs you download will appear here', style: TextStyle(color: AppColors.textTertiary, fontSize: 14)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: state.downloads.length,
                  itemBuilder: (context, index) {
                    final download = state.downloads[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: SongCover(path: download.coverPath, size: 48),
                        title: Text(download.title, style: const TextStyle(color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle: Text(download.artistName ?? 'Unknown artist', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        trailing: PopupMenuButton(
                          itemBuilder: (context) => [
                            const PopupMenuItem(value: 'play', child: Text('Play')),
                            const PopupMenuItem(value: 'delete', child: Text('Delete')),
                          ],
                          onSelected: (value) async {
                            if (value == 'play') {
                              final song = Song(
                                id: download.songId,
                                title: download.title,
                                slug: download.songId,
                                artistId: '',
                                status: 'PUBLISHED',
                                playCount: 0,
                                createdAt: DateTime.now(),
                                coverPath: download.coverPath,
                              );
                              ref.read(playerProvider.notifier).playFromLocal(download.localPath, song);
                              if (context.mounted) context.push('/now-playing');
                            } else if (value == 'delete') {
                              await ref.read(downloadsProvider.notifier).deleteDownload(download.songId);
                            }
                          },
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
