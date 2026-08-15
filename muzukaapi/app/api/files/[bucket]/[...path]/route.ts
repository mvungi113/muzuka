import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ALLOWED_BUCKETS = ['songs', 'covers', 'artist-images', 'album-images', 'avatars'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  const { bucket, path } = await params;

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return Response.json({ error: 'Invalid bucket' }, { status: 400 });
  }

  const filePath = path.join('/');

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600);

  if (error) {
    return Response.json({ error: 'File not found' }, { status: 404 });
  }

  return Response.redirect(data.signedUrl, 302);
}
