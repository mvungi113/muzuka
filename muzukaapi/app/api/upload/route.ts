import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { storage, STORAGE_BUCKETS } from '@/lib/storage';
import { successResponse, errorResponse } from '@/lib/api-response';
import { v4 as uuid } from 'uuid';

const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const MIME_MAP: Record<string, string> = {
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg',
  '.aac': 'audio/aac', '.m4a': 'audio/mp4', '.flac': 'audio/flac',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
};

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
}

function getMimeType(ext: string): string {
  return MIME_MAP[ext] || 'application/octet-stream';
}

function getBucket(type: string): string {
  switch (type) {
    case 'song': return STORAGE_BUCKETS.SONGS;
    case 'cover': return STORAGE_BUCKETS.COVERS;
    case 'artist-image': return STORAGE_BUCKETS.ARTIST_IMAGES;
    case 'album-image': return STORAGE_BUCKETS.ALBUM_IMAGES;
    case 'avatar': return STORAGE_BUCKETS.AVATARS;
    default: return STORAGE_BUCKETS.COVERS;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'cover';

    if (!file) {
      return Response.json(errorResponse('No file provided', 'NO_FILE'), { status: 400 });
    }

    const ext = getExtension(file.name);
    const extLower = ext.replace('.', '');
    const isAudio = type === 'song' || AUDIO_EXTENSIONS.includes(extLower);
    const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      return Response.json(
        errorResponse(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: ${maxSize / 1024 / 1024}MB`, 'FILE_TOO_LARGE'),
        { status: 400 }
      );
    }

    const bucket = getBucket(type);
    const path = `${uuid()}${ext}`;
    const contentType = getMimeType(ext);

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedPath = await storage.upload(bucket, path, buffer, contentType);

    const url = storage.getUrl(bucket, uploadedPath);

    return Response.json(
      successResponse({
        path: uploadedPath,
        url,
        bucket,
        size: file.size,
        type: contentType,
        name: file.name,
      }),
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Upload error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
