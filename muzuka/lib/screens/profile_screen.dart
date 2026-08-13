import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../providers/auth_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  late TextEditingController _nameController;
  bool _isEditing = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    _nameController = TextEditingController(text: user?.name ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    try {
      final response = await apiClient.patch<Map<String, dynamic>>(
        ApiConstants.me,
        body: {'name': _nameController.text.trim()},
        fromJson: (json) => json,
      );
      if (response.success && mounted) {
        setState(() => _isEditing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: AppColors.background,
        foregroundColor: AppColors.textPrimary,
        actions: [
          if (_isEditing)
            TextButton(
              onPressed: _isSaving ? null : _saveProfile,
              child: _isSaving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Save', style: TextStyle(color: AppColors.primary)),
            )
          else
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => setState(() => _isEditing = true),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Center(
            child: CircleAvatar(
              radius: 50,
              backgroundColor: AppColors.surfaceLight,
              backgroundImage: user?.avatarUrl != null ? NetworkImage(user!.avatarUrl!) : null,
              child: user?.avatarUrl == null
                  ? Text(
                      (user?.name ?? 'U')[0].toUpperCase(),
                      style: const TextStyle(fontSize: 32, color: AppColors.textPrimary),
                    )
                  : null,
            ),
          ),
          const SizedBox(height: 24),
          if (_isEditing) ...[
            const Text('Name', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            const SizedBox(height: 8),
            TextField(
              controller: _nameController,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: InputDecoration(
                filled: true,
                fillColor: AppColors.surfaceLight,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ] else ...[
            _buildInfoTile('Name', user?.name ?? '-'),
            _buildInfoTile('Email', user?.email ?? '-'),
            _buildInfoTile('Role', user?.role ?? '-'),
          ],
          const SizedBox(height: 32),
          const Text(
            'Account',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.lock_outline, color: AppColors.textPrimary),
            title: const Text('Change Password', style: TextStyle(color: AppColors.textPrimary)),
            trailing: const Icon(Icons.chevron_right, color: AppColors.textTertiary),
            onTap: () => _showChangePasswordDialog(context),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTile(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: AppColors.textPrimary, fontSize: 16)),
        ],
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context) {
    final currentController = TextEditingController();
    final newController = TextEditingController();
    final confirmController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Change Password', style: TextStyle(color: AppColors.textPrimary)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: currentController,
              obscureText: true,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Current Password',
                labelStyle: const TextStyle(color: AppColors.textTertiary),
                filled: true,
                fillColor: AppColors.surfaceLight,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: newController,
              obscureText: true,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: InputDecoration(
                labelText: 'New Password',
                labelStyle: const TextStyle(color: AppColors.textTertiary),
                filled: true,
                fillColor: AppColors.surfaceLight,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: confirmController,
              obscureText: true,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: InputDecoration(
                labelText: 'Confirm Password',
                labelStyle: const TextStyle(color: AppColors.textTertiary),
                filled: true,
                fillColor: AppColors.surfaceLight,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textTertiary)),
          ),
          TextButton(
            onPressed: () async {
              if (newController.text != confirmController.text) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Passwords do not match')),
                );
                return;
              }
              if (newController.text.length < 8) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Password must be at least 8 characters')),
                );
                return;
              }
              try {
                final response = await apiClient.post<Map<String, dynamic>>(
                  ApiConstants.changePassword,
                  body: {
                    'currentPassword': currentController.text,
                    'newPassword': newController.text,
                  },
                  fromJson: (json) => json,
                );
                if (response.success && context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Password changed successfully')),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Change', style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }
}
