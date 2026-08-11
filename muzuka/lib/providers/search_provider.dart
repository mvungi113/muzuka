import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/models.dart';
import '../services/api_client.dart';
import '../core/constants/api_constants.dart';

class SearchState {
  final List<Song> songs;
  final List<Artist> artists;
  final List<Album> albums;
  final List<Genre> genres;
  final bool isLoading;
  final String? error;
  final String query;

  SearchState({
    this.songs = const [],
    this.artists = const [],
    this.albums = const [],
    this.genres = const [],
    this.isLoading = false,
    this.error,
    this.query = '',
  });

  SearchState copyWith({
    List<Song>? songs,
    List<Artist>? artists,
    List<Album>? albums,
    List<Genre>? genres,
    bool? isLoading,
    String? error,
    String? query,
  }) {
    return SearchState(
      songs: songs ?? this.songs,
      artists: artists ?? this.artists,
      albums: albums ?? this.albums,
      genres: genres ?? this.genres,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      query: query ?? this.query,
    );
  }

  bool get hasResults =>
      songs.isNotEmpty || artists.isNotEmpty || albums.isNotEmpty || genres.isNotEmpty;
}

class SearchNotifier extends StateNotifier<SearchState> {
  final ApiClient _api;

  SearchNotifier(this._api) : super(SearchState());

  Future<void> search(String query) async {
    if (query.trim().length < 2) {
      state = SearchState();
      return;
    }

    state = state.copyWith(isLoading: true, query: query, error: null);
    try {
      final response = await _api.get<Map<String, dynamic>>(
        ApiConstants.search,
        queryParams: {'q': query, 'limit': '10'},
        fromJson: (json) => json as Map<String, dynamic>,
      );

      if (response.success && response.data != null) {
        final data = response.data!;
        state = state.copyWith(
          songs: (data['songs'] as List?)?.map((e) => Song.fromJson(e)).toList() ?? [],
          artists: (data['artists'] as List?)?.map((e) => Artist.fromJson(e)).toList() ?? [],
          albums: (data['albums'] as List?)?.map((e) => Album.fromJson(e)).toList() ?? [],
          genres: (data['genres'] as List?)?.map((e) => Genre.fromJson(e)).toList() ?? [],
          isLoading: false,
        );
      } else {
        state = state.copyWith(isLoading: false, error: response.message);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void clear() {
    state = SearchState();
  }
}

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  return SearchNotifier(apiClient);
});
