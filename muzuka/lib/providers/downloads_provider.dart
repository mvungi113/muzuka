import 'dart:convert';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import '../models/song.dart';
import '../services/api_client.dart';
import '../core/constants/api_constants.dart';

class DownloadItem {
  final String songId;
  final String title;
  final String? artistName;
  final String? coverPath;
  final String localPath;
  final DateTime downloadedAt;
  final int? fileSize;

  DownloadItem({
    required this.songId,
    required this.title,
    this.artistName,
    this.coverPath,
    required this.localPath,
    required this.downloadedAt,
    this.fileSize,
  });

  factory DownloadItem.fromJson(Map<String, dynamic> json) => DownloadItem(
        songId: json['songId'] ?? '',
        title: json['title'] ?? '',
        artistName: json['artistName'],
        coverPath: json['coverPath'],
        localPath: json['localPath'] ?? '',
        downloadedAt: DateTime.parse(json['downloadedAt'] ?? DateTime.now().toIso8601String()),
        fileSize: json['fileSize'],
      );

  Map<String, dynamic> toJson() => {
        'songId': songId,
        'title': title,
        'artistName': artistName,
        'coverPath': coverPath,
        'localPath': localPath,
        'downloadedAt': downloadedAt.toIso8601String(),
        'fileSize': fileSize,
      };
}

class DownloadsState {
  final List<DownloadItem> downloads;
  final bool isLoading;
  final String? error;
  final String? downloadingId;

  DownloadsState({
    this.downloads = const [],
    this.isLoading = false,
    this.error,
    this.downloadingId,
  });

  DownloadsState copyWith({
    List<DownloadItem>? downloads,
    bool? isLoading,
    String? error,
    String? downloadingId,
    bool clearDownloadingId = false,
  }) {
    return DownloadsState(
      downloads: downloads ?? this.downloads,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      downloadingId: clearDownloadingId ? null : (downloadingId ?? this.downloadingId),
    );
  }
}

class DownloadsNotifier extends StateNotifier<DownloadsState> {
  final ApiClient _api;

  DownloadsNotifier(this._api) : super(DownloadsState()) {
    _loadDownloads();
  }

  Future<void> _loadDownloads() async {
    state = state.copyWith(isLoading: true);
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/downloads.json');
      if (await file.exists()) {
        final content = await file.readAsString();
        if (content.isNotEmpty) {
          try {
            final List<dynamic> jsonList = jsonDecode(content) as List<dynamic>;
            final downloads = jsonList.cast<Map<String, dynamic>>().map((e) => DownloadItem.fromJson(e)).toList();
            state = state.copyWith(downloads: downloads, isLoading: false);
            return;
          } catch (_) {}
        }
      }
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> _saveDownloads() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/downloads.json');
      final json = state.downloads.map((d) => d.toJson()).toList();
      await file.writeAsString(jsonEncode(json));
    } catch (_) {}
  }

  Future<bool> download(Song song) async {
    if (state.downloadingId != null) return false;
    if (isDownloaded(song.id)) return false;

    state = state.copyWith(downloadingId: song.id);
    try {
      final response = await _api.get<Map<String, dynamic>>(
        ApiConstants.stream(song.id),
        fromJson: (json) => json as Map<String, dynamic>,
      );

      if (!response.success || response.data == null) {
        state = state.copyWith(clearDownloadingId: true, error: 'Failed to get download URL');
        return false;
      }

      final url = response.data!['url'] as String;
      final dir = await getApplicationDocumentsDirectory();
      final fileName = '${song.id}.mp3';
      final filePath = '${dir.path}/songs/$fileName';

      // Ensure directory exists
      final songsDir = Directory('${dir.path}/songs');
      if (!await songsDir.exists()) {
        await songsDir.create(recursive: true);
      }

      // Download file
      final client = HttpClient();
      final request = await client.getUrl(Uri.parse(url));
      final httpResponse = await request.close();
      final bytes = await httpResponse.fold<List<int>>([], (prev, chunk) => prev..addAll(chunk));
      await File(filePath).writeAsBytes(bytes);

      final download = DownloadItem(
        songId: song.id,
        title: song.title,
        artistName: song.artist?.name,
        coverPath: song.coverPath,
        localPath: filePath,
        downloadedAt: DateTime.now(),
        fileSize: bytes.length,
      );

      state = state.copyWith(
        downloads: [...state.downloads, download],
        downloadingId: null,
      );

      await _saveDownloads();
      return true;
    } catch (e) {
      state = state.copyWith(downloadingId: null, error: e.toString());
      return false;
    }
  }

  Future<bool> deleteDownload(String songId) async {
    try {
      final download = state.downloads.firstWhere((d) => d.songId == songId);
      final file = File(download.localPath);
      if (await file.exists()) {
        await file.delete();
      }
      state = state.copyWith(
        downloads: state.downloads.where((d) => d.songId != songId).toList(),
      );
      await _saveDownloads();
      return true;
    } catch (e) {
      return false;
    }
  }

  bool isDownloaded(String songId) {
    return state.downloads.any((d) => d.songId == songId);
  }

  DownloadItem? getDownload(String songId) {
    try {
      return state.downloads.firstWhere((d) => d.songId == songId);
    } catch (_) {
      return null;
    }
  }
}

final downloadsProvider = StateNotifierProvider<DownloadsNotifier, DownloadsState>((ref) {
  return DownloadsNotifier(apiClient);
});
