import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../core/constants/api_constants.dart';

class SongsState {
  final List<Song> songs;
  final bool isLoading;
  final String? error;
  final int page;
  final int totalPages;
  final bool hasMore;

  SongsState({
    this.songs = const [],
    this.isLoading = false,
    this.error,
    this.page = 1,
    this.totalPages = 1,
    this.hasMore = true,
  });

  SongsState copyWith({
    List<Song>? songs,
    bool? isLoading,
    String? error,
    int? page,
    int? totalPages,
    bool? hasMore,
  }) {
    return SongsState(
      songs: songs ?? this.songs,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      page: page ?? this.page,
      totalPages: totalPages ?? this.totalPages,
      hasMore: hasMore ?? this.hasMore,
    );
  }
}

class SongsNotifier extends StateNotifier<SongsState> {
  final ApiClient _api;
  final String _endpoint;
  final Map<String, String>? _extraParams;

  SongsNotifier(this._api, this._endpoint, [this._extraParams]) : super(SongsState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final params = <String, String>{
        'page': '1',
        'limit': '20',
        ...?_extraParams,
      };
      final response = await _api.get<List<dynamic>>(
        _endpoint,
        queryParams: params,
        fromJson: (json) => json as List,
      );
      if (response.success && response.data != null) {
        final songs = (response.data as List).map((e) => Song.fromJson(e)).toList();
        state = state.copyWith(
          songs: songs,
          isLoading: false,
          page: 1,
          hasMore: songs.length >= 20,
        );
      } else {
        state = state.copyWith(isLoading: false, error: response.message);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadMore() async {
    if (state.isLoading || !state.hasMore) return;
    state = state.copyWith(isLoading: true);
    try {
      final params = <String, String>{
        'page': (state.page + 1).toString(),
        'limit': '20',
        ...?_extraParams,
      };
      final response = await _api.get<List<dynamic>>(
        _endpoint,
        queryParams: params,
        fromJson: (json) => json as List,
      );
      if (response.success && response.data != null) {
        final songs = (response.data as List).map((e) => Song.fromJson(e)).toList();
        state = state.copyWith(
          songs: [...state.songs, ...songs],
          isLoading: false,
          page: state.page + 1,
          hasMore: songs.length >= 20,
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }
}

final songsProvider = StateNotifierProvider<SongsNotifier, SongsState>((ref) {
  return SongsNotifier(apiClient, '${ApiConstants.songs}?status=PUBLISHED');
});

final trendingProvider = StateNotifierProvider<SongsNotifier, SongsState>((ref) {
  return SongsNotifier(apiClient, ApiConstants.songs, {'limit': '10'});
});

final newReleasesProvider = StateNotifierProvider<SongsNotifier, SongsState>((ref) {
  return SongsNotifier(apiClient, ApiConstants.songs, {'limit': '10'});
});
