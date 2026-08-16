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

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

  return Response.redirect(data.publicUrl, 302);
}
