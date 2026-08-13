import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PUT(
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
    const { songIds } = body as { songIds: string[] };

    if (!Array.isArray(songIds)) {
      return Response.json(
        errorResponse('songIds must be an array', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    await prisma.$transaction(
      songIds.map((songId, index) =>
        prisma.playlistSong.update({
          where: { playlistId_songId: { playlistId, songId } },
          data: { position: index },
        })
      )
    );

    return Response.json(successResponse(null, 'Playlist reordered'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Reorder playlist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
