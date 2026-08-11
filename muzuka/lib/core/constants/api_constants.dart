class ApiConstants {
  ApiConstants._();

  // Base URL
  static const String baseUrl = 'http://localhost:3000';

  // Auth
  static const String register = '/api/auth/register';
  static const String login = '/api/auth/login';
  static const String logout = '/api/auth/logout';
  static const String me = '/api/auth/me';

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

  // Search
  static const String search = '/api/search';

  // History
  static const String history = '/api/history';

  // Genres
  static const String genres = '/api/genres';

  // Moods
  static const String moods = '/api/moods';
}
