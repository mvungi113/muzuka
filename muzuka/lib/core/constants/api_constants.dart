class ApiConstants {
  ApiConstants._();

  // Base URL - overridable at build time via --dart-define=API_BASE_URL=https://your-api.vercel.app
  static const String _defaultBaseUrl = 'https://muzukaapi.vercel.app';
  static const String baseUrl =
      String.fromEnvironment('API_BASE_URL', defaultValue: _defaultBaseUrl);

  // Auth
  static const String register = '/api/auth/register';
  static const String login = '/api/auth/login';
  static const String logout = '/api/auth/logout';
  static const String me = '/api/auth/me';
  static const String device = '/api/auth/device';

  // Songs
  static const String songs = '/api/songs';
  static String song(String id) => '/api/songs/$id';
  static String stream(String id) => '/api/songs/$id/stream';
  static String like(String id) => '/api/songs/$id/like';

  // Artists
  static const String artists = '/api/artists';
  static String artist(String id) => '/api/artists/$id';
  static String follow(String id) => '/api/artists/$id/follow';

  // Albums
  static const String albums = '/api/albums';
  static String album(String id) => '/api/albums/$id';
  static String albumLike(String id) => '/api/albums/$id/like';

  // Playlists
  static const String playlists = '/api/playlists';
  static String playlist(String id) => '/api/playlists/$id';
  static String playlistSongs(String id) => '/api/playlists/$id/songs';
  static String playlistReorder(String id) =>
      '/api/playlists/$id/songs/reorder';

  // Search
  static const String search = '/api/search';

  // History
  static const String history = '/api/history';
  static const String recentlyPlayed = '/api/recently-played';

  // Genres
  static const String genres = '/api/genres';
  static String genreSongs(String id) => '/api/genres/$id/songs';

  // Moods
  static const String moods = '/api/moods';
  static String moodSongs(String id) => '/api/moods/$id/songs';

  // Recommendations
  static const String recommendations = '/api/recommendations';

  // Top songs
  static const String topSongs = '/api/songs/top';

  // User collections
  static const String likedSongs = '/api/user/liked-songs';
  static const String likedAlbums = '/api/user/liked-albums';
  static const String followedArtists = '/api/user/followed-artists';

  // Profile
  static const String changePassword = '/api/auth/change-password';

  // Upload
  static const String upload = '/api/upload';

  // Admin
  static const String adminUsers = '/api/admin/users';
}
