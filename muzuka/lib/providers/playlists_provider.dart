import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/playlist.dart';
import '../services/api_client.dart';
import '../core/constants/api_constants.dart';

class PlaylistsState {
  final List<Playlist> playlists;
  final bool isLoading;
  final String? error;

  PlaylistsState({this.playlists = const [], this.isLoading = false, this.error});

  PlaylistsState copyWith({List<Playlist>? playlists, bool? isLoading, String? error}) {
    return PlaylistsState(
      playlists: playlists ?? this.playlists,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class PlaylistsNotifier extends StateNotifier<PlaylistsState> {
  final ApiClient _api;

  PlaylistsNotifier(this._api) : super(PlaylistsState());

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get<Map<String, dynamic>>(
        ApiConstants.playlists,
        fromJson: (json) => json,
      );
      if (response.success && response.data != null) {
        final data = response.data!;
        final items = (data['data'] as List?) ?? [];
        final playlists = items.map((e) => Playlist.fromJson(e)).toList();
        state = state.copyWith(playlists: playlists, isLoading: false);
      } else {
        state = state.copyWith(isLoading: false, error: response.message);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<Playlist?> create(String name, {String? description, bool isPublic = false}) async {
    try {
      final response = await _api.post<Map<String, dynamic>>(
        ApiConstants.playlists,
        body: {
          'name': name,
          if (description != null) 'description': description,
          'isPublic': isPublic,
        },
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (response.success && response.data != null) {
        final playlist = Playlist.fromJson(response.data!);
        state = state.copyWith(playlists: [playlist, ...state.playlists]);
        return playlist;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<bool> addSong(String playlistId, String songId) async {
    try {
      final response = await _api.post(
        '${ApiConstants.playlist(playlistId)}/songs',
        body: {'songId': songId},
      );
      if (response.success) {
        await load();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> removeSong(String playlistId, String songId) async {
    try {
      final response = await _api.delete('${ApiConstants.playlist(playlistId)}/songs/$songId');
      if (response.success) {
        await load();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> delete(String playlistId) async {
    try {
      final response = await _api.delete(ApiConstants.playlist(playlistId));
      if (response.success) {
        state = state.copyWith(
          playlists: state.playlists.where((p) => p.id != playlistId).toList(),
        );
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

final playlistsProvider = StateNotifierProvider<PlaylistsNotifier, PlaylistsState>((ref) {
  return PlaylistsNotifier(apiClient);
});
