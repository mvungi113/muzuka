import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { storage, STORAGE_BUCKETS } from '@/lib/storage';
import { successResponse, errorResponse } from '@/lib/api-response';
import { v4 as uuid } from 'uuid';

const ALLOWED_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/mp4'];
const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
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

    const isAudio = type === 'song';
    const allowedTypes = isAudio ? ALLOWED_AUDIO : ALLOWED_IMAGES;
    const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        errorResponse(`Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`, 'INVALID_FILE_TYPE'),
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return Response.json(
        errorResponse(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: ${maxSize / 1024 / 1024}MB`, 'FILE_TOO_LARGE'),
        { status: 400 }
      );
    }

    const ext = getExtension(file.name);
    const path = `${uuid()}${ext}`;
    const bucket = getBucket(type);

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedPath = await storage.upload(bucket, path, buffer);

    const url = storage.getUrl(bucket, uploadedPath);

    return Response.json(
      successResponse({
        path: uploadedPath,
        url,
        bucket,
        size: file.size,
        type: file.type,
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
