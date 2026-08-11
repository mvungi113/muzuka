import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../providers/search_provider.dart';
import '../widgets/song_cover.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                onChanged: (value) {
                  ref.read(searchProvider.notifier).search(value);
                },
                decoration: InputDecoration(
                  hintText: 'Search songs, artists, albums...',
                  hintStyle: TextStyle(color: AppColors.textTertiary),
                  prefixIcon: Icon(Icons.search, color: AppColors.textTertiary),
                  suffixIcon: _controller.text.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.clear, color: AppColors.textTertiary),
                          onPressed: () {
                            _controller.clear();
                            ref.read(searchProvider.notifier).clear();
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: AppColors.surfaceLight,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            Expanded(
              child: searchState.query.isEmpty
                  ? _buildSuggestions()
                  : searchState.isLoading
                      ? Center(child: CircularProgressIndicator(color: AppColors.primary))
                      : searchState.hasResults
                          ? _buildResults(searchState)
                          : _buildEmpty(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSuggestions() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search, size: 64, color: AppColors.textTertiary),
          const SizedBox(height: 16),
          Text(
            'Search for songs, artists, or albums',
            style: TextStyle(color: AppColors.textTertiary, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Text(
        'No results found',
        style: TextStyle(color: AppColors.textTertiary, fontSize: 16),
      ),
    );
  }

  Widget _buildResults(SearchState state) {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      children: [
        if (state.songs.isNotEmpty) ...[
          _sectionTitle('Songs'),
          ...state.songs.map((song) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: SongCover(path: song.coverPath, size: 48),
                title: Text(
                  song.title,
                  style: const TextStyle(color: AppColors.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  song.artist?.name ?? '',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
                trailing: Text(
                  song.durationFormatted ?? '',
                  style: const TextStyle(color: AppColors.textTertiary, fontSize: 12),
                ),
                onTap: () => context.push('/song/${song.id}'),
              )),
        ],
        if (state.artists.isNotEmpty) ...[
          _sectionTitle('Artists'),
          ...state.artists.map((artist) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(
                  backgroundColor: AppColors.surfaceLight,
                  child: Text(
                    artist.name[0].toUpperCase(),
                    style: const TextStyle(color: AppColors.primary),
                  ),
                ),
                title: Text(
                  artist.name,
                  style: const TextStyle(color: AppColors.textPrimary),
                ),
                subtitle: Text(
                  '${artist.songCount} songs',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
                onTap: () => context.push('/artist/${artist.id}'),
              )),
        ],
        if (state.albums.isNotEmpty) ...[
          _sectionTitle('Albums'),
          ...state.albums.map((album) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: SongCover(path: album.coverPath, size: 48),
                title: Text(
                  album.title,
                  style: const TextStyle(color: AppColors.textPrimary),
                ),
                subtitle: Text(
                  album.artistName ?? '',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
                onTap: () => context.push('/album/${album.id}'),
              )),
        ],
        const SizedBox(height: 80),
      ],
    );
  }

  Widget _sectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: const TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
