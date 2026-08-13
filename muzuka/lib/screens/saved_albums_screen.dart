import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/album.dart';
import '../services/api_client.dart';
import '../widgets/song_cover.dart';

class SavedAlbumsScreen extends ConsumerStatefulWidget {
  const SavedAlbumsScreen({super.key});

  @override
  ConsumerState<SavedAlbumsScreen> createState() => _SavedAlbumsScreenState();
}

class _SavedAlbumsScreenState extends ConsumerState<SavedAlbumsScreen> {
  List<Album> _albums = [];
  bool _isLoading = true;
  int _page = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadAlbums();
  }

  Future<void> _loadAlbums() async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.likedAlbums}?page=$_page&limit=20',
        fromJson: (json) => json,
      );
      if (response.success && response.data != null) {
        final data = response.data!;
        final items = (data['data'] as List).map((e) => Album.fromJson(e)).toList();
        final totalPages = data['pagination']['totalPages'] ?? 1;
        setState(() {
          if (_page == 1) {
            _albums = items;
          } else {
            _albums = [..._albums, ...items];
          }
          _hasMore = _page < totalPages;
          _isLoading = false;
        });
      }
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Albums'),
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _albums.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.album, size: 64, color: AppColors.textTertiary),
                      SizedBox(height: 16),
                      Text('No saved albums yet', style: TextStyle(color: AppColors.textTertiary, fontSize: 16)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.only(bottom: 100),
                  itemCount: _albums.length + (_hasMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _albums.length) {
                      _page++;
                      _loadAlbums();
                      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
                    }
                    final album = _albums[index];
                    return ListTile(
                      leading: SongCover(path: album.coverPath, size: 48, borderRadius: 4),
                      title: Text(album.title, style: const TextStyle(color: AppColors.textPrimary)),
                      subtitle: Text(album.artist?.name ?? '', style: const TextStyle(color: AppColors.textSecondary)),
                      onTap: () => context.push('/album/${album.id}'),
                    );
                  },
                ),
    );
  }
}
