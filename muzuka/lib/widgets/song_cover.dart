import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../core/constants/api_constants.dart';
import '../core/theme/app_theme.dart';

class SongCover extends StatelessWidget {
  final String? path;
  final double size;
  final double borderRadius;
  final String bucket;

  const SongCover({
    super.key,
    this.path,
    this.size = 48,
    this.borderRadius = 8,
    this.bucket = 'covers',
  });

  @override
  Widget build(BuildContext context) {
    final url = path != null ? '${ApiConstants.baseUrl}/api/files/$bucket/$path' : null;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        gradient: url == null ? AppColors.primaryGradient : null,
      ),
      clipBehavior: Clip.antiAlias,
      child: url != null
          ? CachedNetworkImage(
              imageUrl: url,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: AppColors.surfaceLight,
                child: const Icon(Icons.music_note, color: AppColors.textTertiary),
              ),
              errorWidget: (context, url, error) => Container(
                color: AppColors.surfaceLight,
                child: const Icon(Icons.music_note, color: AppColors.textTertiary),
              ),
            )
          : const Icon(Icons.music_note, color: Colors.white),
    );
  }
}
