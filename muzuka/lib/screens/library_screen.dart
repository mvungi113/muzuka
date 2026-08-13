import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';

class LibraryScreen extends ConsumerWidget {
  const LibraryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          children: [
            Text(
              'Library',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 24),
            _buildMenuItem(
              context,
              icon: Icons.favorite,
              title: 'Liked Songs',
              onTap: () => context.push('/liked-songs'),
            ),
            _buildMenuItem(
              context,
              icon: Icons.queue_music,
              title: 'Playlists',
              onTap: () => context.push('/playlists'),
            ),
            _buildMenuItem(
              context,
              icon: Icons.download_done,
              title: 'Downloads',
              onTap: () => context.push('/downloads'),
            ),
            _buildMenuItem(
              context,
              icon: Icons.history,
              title: 'Recently Played',
              onTap: () => context.push('/recently-played'),
            ),
            _buildMenuItem(
              context,
              icon: Icons.album,
              title: 'Saved Albums',
              onTap: () => context.push('/saved-albums'),
            ),
            _buildMenuItem(
              context,
              icon: Icons.people,
              title: 'Followed Artists',
              onTap: () => context.push('/followed-artists'),
            ),
            _buildMenuItem(
              context,
              icon: Icons.person,
              title: 'Profile',
              onTap: () => context.push('/profile'),
            ),
            const Divider(color: AppColors.surfaceLight, height: 32),
            _buildMenuItem(
              context,
              icon: Icons.logout,
              title: 'Logout',
              color: AppColors.error,
              onTap: () async {
                await ref.read(authProvider.notifier).logout();
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? color,
  }) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Icon(icon, color: color ?? AppColors.textPrimary, size: 24),
      title: Text(
        title,
        style: TextStyle(
          color: color ?? AppColors.textPrimary,
          fontSize: 16,
        ),
      ),
      trailing: Icon(Icons.chevron_right, color: AppColors.textTertiary),
      onTap: onTap,
    );
  }
}
