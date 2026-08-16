import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { errorResponse } from '@/lib/api-response';
import { STORAGE_BUCKETS } from '@/lib/storage';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const song = await prisma.song.findUnique({
      where: { id },
      select: { id: true, audioPath: true, status: true },
    });

    if (!song || !song.audioPath) {
      return Response.json(errorResponse('Song not found', 'SONG_NOT_FOUND'), { status: 404 });
    }

    if (song.status !== 'PUBLISHED') {
      return Response.json(errorResponse('Song not available', 'SONG_NOT_AVAILABLE'), { status: 403 });
    }

    const { data } = supabaseAdmin.storage
      .from(STORAGE_BUCKETS.SONGS)
      .getPublicUrl(song.audioPath);

    return Response.json({ success: true, data: { url: data.publicUrl } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Stream error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
