import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: songId } = await params;

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return Response.json(errorResponse('Song not found', 'SONG_NOT_FOUND'), { status: 404 });
    }

    const existing = await prisma.songLike.findUnique({
      where: { userId_songId: { userId: user.id, songId } },
    });

    if (existing) {
      return Response.json(errorResponse('Already liked', 'ALREADY_LIKED'), { status: 409 });
    }

    await prisma.songLike.create({
      data: { userId: user.id, songId },
    });

    return Response.json(successResponse(null, 'Song liked'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Like song error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: songId } = await params;

    const existing = await prisma.songLike.findUnique({
      where: { userId_songId: { userId: user.id, songId } },
    });

    if (!existing) {
      return Response.json(errorResponse('Not liked', 'NOT_LIKED'), { status: 404 });
    }

    await prisma.songLike.delete({
      where: { userId_songId: { userId: user.id, songId } },
    });

    return Response.json(successResponse(null, 'Song unliked'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Unlike song error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
