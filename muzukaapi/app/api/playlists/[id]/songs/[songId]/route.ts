import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; songId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: playlistId, songId } = await params;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
      return Response.json(errorResponse('Playlist not found', 'PLAYLIST_NOT_FOUND'), { status: 404 });
    }
    if (playlist.userId !== user.id) {
      return Response.json(errorResponse('Not your playlist', 'FORBIDDEN'), { status: 403 });
    }

    const existing = await prisma.playlistSong.findUnique({
      where: { playlistId_songId: { playlistId, songId } },
    });

    if (!existing) {
      return Response.json(errorResponse('Song not in playlist', 'SONG_NOT_IN_PLAYLIST'), { status: 404 });
    }

    await prisma.playlistSong.delete({
      where: { playlistId_songId: { playlistId, songId } },
    });

    return Response.json(successResponse(null, 'Song removed from playlist'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Remove from playlist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
