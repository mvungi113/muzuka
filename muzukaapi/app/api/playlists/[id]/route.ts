import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { playlistSchema, addToPlaylistSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        playlistSongs: {
          include: {
            song: {
              include: {
                artist: { select: { id: true, name: true, slug: true } },
                album: { select: { id: true, title: true, slug: true, coverPath: true } },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        _count: { select: { playlistSongs: true } },
      },
    });

    if (!playlist) {
      return Response.json(errorResponse('Playlist not found', 'PLAYLIST_NOT_FOUND'), { status: 404 });
    }

    if (!playlist.isPublic) {
      const user = await requireAuth();
      if (user.id !== playlist.userId) {
        return Response.json(errorResponse('Playlist not found', 'PLAYLIST_NOT_FOUND'), { status: 404 });
      }
    }

    return Response.json(successResponse(playlist));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Get playlist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Playlist not found', 'PLAYLIST_NOT_FOUND'), { status: 404 });
    }
    if (existing.userId !== user.id) {
      return Response.json(errorResponse('Not your playlist', 'FORBIDDEN'), { status: 403 });
    }

    const body = await request.json();
    const parsed = playlistSchema.partial().safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.update({ where: { id }, data: parsed.data });
    return Response.json(successResponse(playlist));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Update playlist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Playlist not found', 'PLAYLIST_NOT_FOUND'), { status: 404 });
    }
    if (existing.userId !== user.id) {
      return Response.json(errorResponse('Not your playlist', 'FORBIDDEN'), { status: 403 });
    }

    await prisma.playlist.delete({ where: { id } });
    return Response.json(successResponse(null, 'Playlist deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Delete playlist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
