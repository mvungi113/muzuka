import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/genre.dart';
import '../models/song.dart';
import '../services/api_client.dart';

class DiscoverScreen extends ConsumerStatefulWidget {
  const DiscoverScreen({super.key});

  @override
  ConsumerState<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends ConsumerState<DiscoverScreen> {
  List<Genre> _genres = [];
  bool _isLoadingGenres = true;

  @override
  void initState() {
    super.initState();
    _loadGenres();
  }

  Future<void> _loadGenres() async {
    try {
      final response = await apiClient.get<List<dynamic>>(
        '${ApiConstants.genres}?limit=20',
        fromJson: (json) => json as List,
      );
      if (response.success && response.data != null) {
        setState(() {
          _genres = (response.data as List).map((e) => Genre.fromJson(e)).toList();
          _isLoadingGenres = false;
        });
      }
    } catch (_) {
      setState(() => _isLoadingGenres = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Text(
                  'Discover',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: _buildMoodSection(),
            ),
            SliverToBoxAdapter(
              child: _buildGenreSection(),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildMoodSection() {
    final moods = [
      {'name': 'Happy', 'emoji': '😊', 'color': '#FFD93D'},
      {'name': 'Romantic', 'emoji': '❤️', 'color': '#FF6B6B'},
      {'name': 'Chill', 'emoji': '😌', 'color': '#6BCB77'},
      {'name': 'Energy', 'emoji': '⚡', 'color': '#FFD93D'},
      {'name': 'Sad', 'emoji': '😢', 'color': '#6C63FF'},
      {'name': 'Party', 'emoji': '🎉', 'color': '#FF6B6B'},
      {'name': 'Workout', 'emoji': '💪', 'color': '#FFD93D'},
      {'name': 'Worship', 'emoji': '🙏', 'color': '#6C63FF'},
      {'name': 'Focus', 'emoji': '🎯', 'color': '#6BCB77'},
      {'name': 'Relax', 'emoji': '🧘', 'color': '#6BCB77'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(20, 24, 20, 12),
          child: Text(
            'Browse by Mood',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        SizedBox(
          height: 100,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            scrollDirection: Axis.horizontal,
            itemCount: moods.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final mood = moods[index];
              return GestureDetector(
                onTap: () {
                  // TODO: Navigate to mood songs
                },
                child: Container(
                  width: 100,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        mood['emoji']!,
                        style: const TextStyle(fontSize: 28),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        mood['name']!,
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildGenreSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(20, 24, 20, 12),
          child: Text(
            'Browse by Genre',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        if (_isLoadingGenres)
          const SizedBox(
            height: 100,
            child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
          )
        else
          SizedBox(
            height: 100,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              scrollDirection: Axis.horizontal,
              itemCount: _genres.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final genre = _genres[index];
                return GestureDetector(
                  onTap: () {
                    // TODO: Navigate to genre songs
                  },
                  child: Container(
                    width: 100,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.music_note, color: AppColors.primary, size: 28),
                        const SizedBox(height: 4),
                        Text(
                          genre.name,
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
