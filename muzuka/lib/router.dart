import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../screens/home_screen.dart';
import '../screens/search_screen.dart';
import '../screens/discover_screen.dart';
import '../screens/library_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/player/now_playing_screen.dart';
import '../screens/song_detail_screen.dart';
import '../screens/artist_detail_screen.dart';
import '../screens/album_detail_screen.dart';
import '../screens/playlists_screen.dart';
import '../screens/downloads_screen.dart';
import '../screens/liked_songs_screen.dart';
import '../screens/recently_played_screen.dart';
import '../screens/saved_albums_screen.dart';
import '../screens/followed_artists_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/genre_songs_screen.dart';
import '../screens/mood_songs_screen.dart';
import '../widgets/main_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/login' || state.matchedLocation == '/register';

      if (!isLoggedIn && !isAuthRoute) {
        return '/login';
      }
      if (isLoggedIn && isAuthRoute) {
        return '/';
      }
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/search',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: SearchScreen(),
            ),
          ),
          GoRoute(
            path: '/discover',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: DiscoverScreen(),
            ),
          ),
          GoRoute(
            path: '/library',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: LibraryScreen(),
            ),
          ),
        ],
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/song/:id',
        builder: (context, state) => SongDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/artist/:id',
        builder: (context, state) => ArtistDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/album/:id',
        builder: (context, state) => AlbumDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/now-playing',
        fullscreenDialog: true,
        builder: (context, state) => const NowPlayingScreen(),
      ),
      GoRoute(
        path: '/playlists',
        builder: (context, state) => const PlaylistsScreen(),
      ),
      GoRoute(
        path: '/downloads',
        builder: (context, state) => const DownloadsScreen(),
      ),
      GoRoute(
        path: '/liked-songs',
        builder: (context, state) => const LikedSongsScreen(),
      ),
      GoRoute(
        path: '/recently-played',
        builder: (context, state) => const RecentlyPlayedScreen(),
      ),
      GoRoute(
        path: '/saved-albums',
        builder: (context, state) => const SavedAlbumsScreen(),
      ),
      GoRoute(
        path: '/followed-artists',
        builder: (context, state) => const FollowedArtistsScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/genre/:id',
        builder: (context, state) => GenreSongsScreen(
          genreId: state.pathParameters['id']!,
          genreName: state.uri.queryParameters['name'] ?? 'Genre',
        ),
      ),
      GoRoute(
        path: '/mood/:id',
        builder: (context, state) => MoodSongsScreen(
          moodId: state.pathParameters['id']!,
          moodName: state.uri.queryParameters['name'] ?? 'Mood',
        ),
      ),
    ],
  );
});
