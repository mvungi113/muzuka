import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/artist.dart';
import '../services/api_client.dart';
import '../widgets/song_cover.dart';

class FollowedArtistsScreen extends ConsumerStatefulWidget {
  const FollowedArtistsScreen({super.key});

  @override
  ConsumerState<FollowedArtistsScreen> createState() => _FollowedArtistsScreenState();
}

class _FollowedArtistsScreenState extends ConsumerState<FollowedArtistsScreen> {
  List<Artist> _artists = [];
  bool _isLoading = true;
  int _page = 1;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadArtists();
  }

  Future<void> _loadArtists() async {
    try {
      final response = await apiClient.get<Map<String, dynamic>>(
        '${ApiConstants.followedArtists}?page=$_page&limit=20',
        fromJson: (json) => json,
      );
      if (response.success && response.data != null) {
        final data = response.data!;
        final items = (data['data'] as List).map((e) => Artist.fromJson(e)).toList();
        final totalPages = data['pagination']['totalPages'] ?? 1;
        setState(() {
          if (_page == 1) {
            _artists = items;
          } else {
            _artists = [..._artists, ...items];
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
        title: const Text('Followed Artists'),
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _artists.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.people_outline, size: 64, color: AppColors.textTertiary),
                      SizedBox(height: 16),
                      Text('No followed artists yet', style: TextStyle(color: AppColors.textTertiary, fontSize: 16)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.only(bottom: 100),
                  itemCount: _artists.length + (_hasMore ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == _artists.length) {
                      _page++;
                      _loadArtists();
                      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
                    }
                    final artist = _artists[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: AppColors.surfaceLight,
                        backgroundImage: artist.imagePath != null
                            ? NetworkImage(artist.imagePath!)
                            : null,
                        child: artist.imagePath == null
                            ? Text(
                                artist.name[0].toUpperCase(),
                                style: const TextStyle(color: AppColors.textPrimary),
                              )
                            : null,
                      ),
                      title: Text(artist.name, style: const TextStyle(color: AppColors.textPrimary)),
                      subtitle: Text(
                        '${artist.followerCount ?? 0} followers',
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                      onTap: () => context.push('/artist/${artist.id}'),
                    );
                  },
                ),
    );
  }
}
