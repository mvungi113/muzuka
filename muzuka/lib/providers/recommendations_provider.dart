import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../core/constants/api_constants.dart';

class RecommendationsState {
  final List<Song> recentlyPlayed;
  final List<Song> madeForYou;
  final List<Song> basedOnGenre;
  final List<Song> basedOnArtist;
  final List<Song> basedOnMood;
  final bool isLoading;
  final String? error;

  RecommendationsState({
    this.recentlyPlayed = const [],
    this.madeForYou = const [],
    this.basedOnGenre = const [],
    this.basedOnArtist = const [],
    this.basedOnMood = const [],
    this.isLoading = false,
    this.error,
  });

  RecommendationsState copyWith({
    List<Song>? recentlyPlayed,
    List<Song>? madeForYou,
    List<Song>? basedOnGenre,
    List<Song>? basedOnArtist,
    List<Song>? basedOnMood,
    bool? isLoading,
    String? error,
  }) {
    return RecommendationsState(
      recentlyPlayed: recentlyPlayed ?? this.recentlyPlayed,
      madeForYou: madeForYou ?? this.madeForYou,
      basedOnGenre: basedOnGenre ?? this.basedOnGenre,
      basedOnArtist: basedOnArtist ?? this.basedOnArtist,
      basedOnMood: basedOnMood ?? this.basedOnMood,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class RecommendationsNotifier extends StateNotifier<RecommendationsState> {
  final ApiClient _api;

  RecommendationsNotifier(this._api) : super(RecommendationsState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get<Map<String, dynamic>>(
        '${ApiConstants.recommendations}?limit=10',
        fromJson: (json) => json as Map<String, dynamic>,
      );

      if (response.success && response.data != null) {
        final data = response.data!;
        state = RecommendationsState(
          recentlyPlayed: (data['recentlyPlayed'] as List?)?.map((e) => Song.fromJson(e)).toList() ?? [],
          madeForYou: (data['madeForYou'] as List?)?.map((e) => Song.fromJson(e)).toList() ?? [],
          basedOnGenre: (data['basedOnGenre'] as List?)?.map((e) => Song.fromJson(e)).toList() ?? [],
          basedOnArtist: (data['basedOnArtist'] as List?)?.map((e) => Song.fromJson(e)).toList() ?? [],
          basedOnMood: (data['basedOnMood'] as List?)?.map((e) => Song.fromJson(e)).toList() ?? [],
          isLoading: false,
        );
      } else {
        state = state.copyWith(isLoading: false, error: response.message);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}

final recommendationsProvider = StateNotifierProvider<RecommendationsNotifier, RecommendationsState>((ref) {
  return RecommendationsNotifier(apiClient);
});
