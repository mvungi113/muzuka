import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../core/constants/api_constants.dart';

class PlayerState {
  final Song? currentSong;
  final List<Song> queue;
  final bool isPlaying;
  final bool isLoading;
  final Duration position;
  final Duration duration;
  final bool shuffle;
  final RepeatMode repeatMode;
  final String? error;

  PlayerState({
    this.currentSong,
    this.queue = const [],
    this.isPlaying = false,
    this.isLoading = false,
    this.position = Duration.zero,
    this.duration = Duration.zero,
    this.shuffle = false,
    this.repeatMode = RepeatMode.off,
    this.error,
  });

  PlayerState copyWith({
    Song? currentSong,
    List<Song>? queue,
    bool? isPlaying,
    bool? isLoading,
    Duration? position,
    Duration? duration,
    bool? shuffle,
    RepeatMode? repeatMode,
    String? error,
    bool clearSong = false,
  }) {
    return PlayerState(
      currentSong: clearSong ? null : (currentSong ?? this.currentSong),
      queue: queue ?? this.queue,
      isPlaying: isPlaying ?? this.isPlaying,
      isLoading: isLoading ?? this.isLoading,
      position: position ?? this.position,
      duration: duration ?? this.duration,
      shuffle: shuffle ?? this.shuffle,
      repeatMode: repeatMode ?? this.repeatMode,
      error: error,
    );
  }

  bool get hasPrevious {
    if (queue.isEmpty || currentSong == null) return false;
    final idx = queue.indexWhere((s) => s.id == currentSong!.id);
    return idx > 0;
  }

  bool get hasNext {
    if (queue.isEmpty || currentSong == null) return false;
    final idx = queue.indexWhere((s) => s.id == currentSong!.id);
    return idx < queue.length - 1;
  }
}

enum RepeatMode { off, all, one }

class PlayerNotifier extends StateNotifier<PlayerState> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  final ApiClient _api;

  PlayerNotifier(this._api) : super(PlayerState()) {
    _audioPlayer.positionStream.listen((pos) {
      state = state.copyWith(position: pos);
    });
    _audioPlayer.durationStream.listen((dur) {
      state = state.copyWith(duration: dur ?? Duration.zero);
    });
    _audioPlayer.playerStateStream.listen((playerState) {
      state = state.copyWith(
        isPlaying: playerState.playing,
        isLoading: playerState.processingState == ProcessingState.loading,
      );
      if (playerState.processingState == ProcessingState.completed) {
        _onComplete();
      }
    });
  }

  AudioPlayer get audioPlayer => _audioPlayer;

  Future<void> play(Song song, {List<Song>? queue, int? index}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _api.get<Map<String, dynamic>>(
        ApiConstants.stream(song.id),
        fromJson: (json) => json as Map<String, dynamic>,
      );

      if (response.success && response.data != null) {
        final url = response.data!['url'] as String;
        await _audioPlayer.setUrl(url);

        if (queue != null) {
          state = state.copyWith(queue: queue);
        }

        state = state.copyWith(currentSong: song, isLoading: false);
        await _audioPlayer.play();
        recordHistory(song.id);
      } else {
        state = state.copyWith(
          isLoading: false,
          error: response.message ?? 'Failed to load song',
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> playFromLocal(String filePath, Song song) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _audioPlayer.setFilePath(filePath);
      state = state.copyWith(currentSong: song, isLoading: false);
      await _audioPlayer.play();
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> playSong(Song song, {List<Song>? queue, int? index}) async {
    await play(song, queue: queue, index: index);
  }

  Future<void> pause() async {
    await _audioPlayer.pause();
  }

  Future<void> resume() async {
    await _audioPlayer.play();
  }

  Future<void> togglePlay() async {
    if (state.isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }

  Future<void> seek(Duration position) async {
    await _audioPlayer.seek(position);
  }

  Future<void> next() async {
    if (!state.hasNext || state.currentSong == null) return;
    final idx = state.queue.indexWhere((s) => s.id == state.currentSong!.id);
    final nextSong = state.queue[idx + 1];
    await play(nextSong);
  }

  Future<void> previous() async {
    if (!state.hasPrevious || state.currentSong == null) return;
    final idx = state.queue.indexWhere((s) => s.id == state.currentSong!.id);
    final prevSong = state.queue[idx - 1];
    await play(prevSong);
  }

  void toggleShuffle() {
    state = state.copyWith(shuffle: !state.shuffle);
  }

  void cycleRepeat() {
    switch (state.repeatMode) {
      case RepeatMode.off:
        state = state.copyWith(repeatMode: RepeatMode.all);
        break;
      case RepeatMode.all:
        state = state.copyWith(repeatMode: RepeatMode.one);
        break;
      case RepeatMode.one:
        state = state.copyWith(repeatMode: RepeatMode.off);
        break;
    }
  }

  void _onComplete() {
    if (state.currentSong != null) {
      recordHistory(state.currentSong!.id);
    }
    if (state.repeatMode == RepeatMode.one && state.currentSong != null) {
      play(state.currentSong!);
    } else if (state.hasNext) {
      next();
    } else {
      state = state.copyWith(isPlaying: false);
    }
  }

  Future<void> recordHistory(String songId) async {
    try {
      await _api.post(
        ApiConstants.history,
        body: {
          'songId': songId,
          'durationPlayed': state.duration.inSeconds,
          'completed': state.position.inSeconds >= state.duration.inSeconds - 5,
        },
      );
    } catch (_) {}
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }
}

final playerProvider = StateNotifierProvider<PlayerNotifier, PlayerState>((ref) {
  return PlayerNotifier(apiClient);
});
