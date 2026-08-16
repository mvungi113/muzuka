import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../providers/auth_provider.dart';
import '../providers/songs_provider.dart';
import '../providers/recommendations_provider.dart';
import '../widgets/song_cover.dart';
import '../widgets/shimmer_loading.dart';
import '../widgets/status_widgets.dart' as widgets;

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(trendingProvider.notifier).load();
      ref.read(newReleasesProvider.notifier).load();
      ref.read(recommendationsProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final trending = ref.watch(trendingProvider);
    final newReleases = ref.watch(newReleasesProvider);
    final recommendations = ref.watch(recommendationsProvider);

    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _getGreeting(),
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            Text(
                              auth.user?.name ?? 'Music Lover',
                              style: Theme.of(context).textTheme.headlineMedium,
                            ),
                          ],
                        ),
                        CircleAvatar(
                          radius: 20,
                          backgroundColor: AppColors.surfaceLight,
                          backgroundImage: auth.user?.avatarUrl != null
                              ? NetworkImage('${ApiConstants.baseUrl}/api/files/avatars/${auth.user!.avatarUrl!}')
                              : null,
                          child: auth.user?.avatarUrl == null
                              ? Text(
                                  (auth.user?.name ?? 'M')[0].toUpperCase(),
                                  style: const TextStyle(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                )
                              : null,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            _buildSection(
              context,
              title: 'Trending Now',
              songs: trending.songs,
              isLoading: trending.isLoading,
              error: trending.error,
            ),
            if (recommendations.madeForYou.isNotEmpty)
              _buildSection(
                context,
                title: 'Made For You',
                songs: recommendations.madeForYou,
                isLoading: false,
              ),
            if (recommendations.basedOnMood.isNotEmpty)
              _buildSection(
                context,
                title: 'Based on Your Mood',
                songs: recommendations.basedOnMood,
                isLoading: false,
              ),
            _buildSection(
              context,
              title: 'New Releases',
              songs: newReleases.songs,
              isLoading: newReleases.isLoading,
              error: newReleases.error,
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required List songs,
    required bool isLoading,
    String? error,
  }) {
    return SliverToBoxAdapter(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
            child: Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
          ),
          if (isLoading)
            const HorizontalListShimmer()
          else if (error != null)
            SizedBox(
              height: 180,
              child: widgets.ErrorWidget(
                message: error,
                onRetry: () {},
              ),
            )
          else if (songs.isEmpty)
            SizedBox(
              height: 180,
              child: widgets.EmptyWidget(
                icon: Icons.music_note,
                title: 'No songs available',
              ),
            )
          else
            SizedBox(
              height: 192,
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                scrollDirection: Axis.horizontal,
                itemCount: songs.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final song = songs[index];
                  return GestureDetector(
                    onTap: () => context.push('/song/${song.id}'),
                    child: SizedBox(
                      width: 140,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SongCover(
                            path: song.coverPath,
                            size: 140,
                            borderRadius: 12,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            song.title,
                            style: const TextStyle(
                              color: AppColors.textPrimary,
                              fontSize: 13,
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
                  );
                },
              ),
            ),
        ],
      ),
    );
  }
}
