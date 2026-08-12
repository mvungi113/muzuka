import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { addToPlaylistSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: playlistId } = await params;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
      return Response.json(errorResponse('Playlist not found', 'PLAYLIST_NOT_FOUND'), { status: 404 });
    }
    if (playlist.userId !== user.id) {
      return Response.json(errorResponse('Not your playlist', 'FORBIDDEN'), { status: 403 });
    }

    const body = await request.json();
    const parsed = addToPlaylistSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { songId } = parsed.data;

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return Response.json(errorResponse('Song not found', 'SONG_NOT_FOUND'), { status: 404 });
    }

    const existing = await prisma.playlistSong.findUnique({
      where: { playlistId_songId: { playlistId, songId } },
    });

    if (existing) {
      return Response.json(errorResponse('Song already in playlist', 'SONG_IN_PLAYLIST'), { status: 409 });
    }

    const maxPosition = await prisma.playlistSong.aggregate({
      where: { playlistId },
      _max: { position: true },
    });

    const nextPosition = (maxPosition._max.position ?? -1) + 1;

    await prisma.playlistSong.create({
      data: { playlistId, songId, position: nextPosition },
    });

    return Response.json(successResponse(null, 'Song added to playlist'), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Add to playlist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
