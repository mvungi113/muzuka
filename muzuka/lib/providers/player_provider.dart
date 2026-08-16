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
  final Map<String, String> _urlCache = {};

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
    _audioPlayer.currentIndexStream.listen((index) {
      if (index != null && index >= 0 && index < state.queue.length) {
        final song = state.queue[index];
        final changed = state.currentSong?.id != song.id;
        state = state.copyWith(currentSong: song);
        if (changed && song.id.isNotEmpty) {
          recordHistory(song.id);
        }
      }
    });
  }

  AudioPlayer get audioPlayer => _audioPlayer;

  Future<String?> _resolveUrl(Song song) async {
    if (_urlCache.containsKey(song.id)) return _urlCache[song.id];
    try {
      final response = await _api.get<Map<String, dynamic>>(
        ApiConstants.stream(song.id),
        fromJson: (json) => json as Map<String, dynamic>,
      );
      if (response.success && response.data != null) {
        final url = response.data!['url'] as String;
        _urlCache[song.id] = url;
        return url;
      }
    } catch (_) {}
    return null;
  }

  Future<void> play(Song song, {List<Song>? queue, int? index}) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final q = queue ?? [song];
      final requested = index ?? q.indexWhere((s) => s.id == song.id);
      final effectiveIndex = requested < 0 ? 0 : requested;

      final urls = await Future.wait(q.map((s) => _resolveUrl(s)));

      final resolved = <Song, String>{};
      for (var i = 0; i < q.length; i++) {
        final u = urls[i];
        if (u != null) resolved[q[i]] = u;
      }

      if (resolved.isEmpty) {
        state = state.copyWith(
          isLoading: false,
          error: 'Failed to load song',
        );
        return;
      }

      final entries = resolved.entries.toList();
      final children =
          entries.map((e) => AudioSource.uri(Uri.parse(e.value))).toList();

      var childIndex = entries.indexWhere((e) => e.key.id == q[effectiveIndex].id);
      if (childIndex < 0) childIndex = 0;

      final source = ConcatenatingAudioSource(children: children);
      await _audioPlayer.setAudioSource(
        source,
        initialIndex: childIndex,
        preload: true,
      );

      state = state.copyWith(
        queue: entries.map((e) => e.key).toList(),
        currentSong: entries[childIndex].key,
        isLoading: false,
      );
      await _audioPlayer.play();
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> playFromLocal(String filePath, Song song) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _audioPlayer.setFilePath(filePath);
      state = state.copyWith(
        queue: [song],
        currentSong: song,
        isLoading: false,
      );
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
    if (_audioPlayer.hasNext) {
      await _audioPlayer.seekToNext();
    } else if (state.hasNext) {
      final idx = state.queue.indexWhere((s) => s.id == state.currentSong!.id);
      await play(state.queue[idx + 1]);
    }
  }

  Future<void> previous() async {
    if (_audioPlayer.hasPrevious) {
      await _audioPlayer.seekToPrevious();
    } else {
      await _audioPlayer.seek(Duration.zero);
    }
  }

  void toggleShuffle() {
    final next = !state.shuffle;
    _audioPlayer.setShuffleModeEnabled(next);
    state = state.copyWith(shuffle: next);
  }

  void cycleRepeat() {
    late final RepeatMode nextMode;
    late final LoopMode loopMode;
    switch (state.repeatMode) {
      case RepeatMode.off:
        nextMode = RepeatMode.all;
        loopMode = LoopMode.all;
        break;
      case RepeatMode.all:
        nextMode = RepeatMode.one;
        loopMode = LoopMode.one;
        break;
      case RepeatMode.one:
        nextMode = RepeatMode.off;
        loopMode = LoopMode.off;
        break;
    }
    _audioPlayer.setLoopMode(loopMode);
    state = state.copyWith(repeatMode: nextMode);
  }

  void _onComplete() {
    if (state.currentSong != null) {
      recordHistory(state.currentSong!.id);
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
