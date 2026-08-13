import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: albumId } = await params;

    const album = await prisma.album.findUnique({ where: { id: albumId } });
    if (!album) {
      return Response.json(errorResponse('Album not found', 'ALBUM_NOT_FOUND'), { status: 404 });
    }

    const existing = await prisma.albumLike.findUnique({
      where: { userId_albumId: { userId: user.id, albumId } },
    });

    if (existing) {
      return Response.json(errorResponse('Already liked', 'ALREADY_LIKED'), { status: 409 });
    }

    await prisma.albumLike.create({
      data: { userId: user.id, albumId },
    });

    return Response.json(successResponse(null, 'Album liked'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Like album error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: albumId } = await params;

    const existing = await prisma.albumLike.findUnique({
      where: { userId_albumId: { userId: user.id, albumId } },
    });

    if (!existing) {
      return Response.json(errorResponse('Not liked', 'NOT_LIKED'), { status: 404 });
    }

    await prisma.albumLike.delete({
      where: { userId_albumId: { userId: user.id, albumId } },
    });

    return Response.json(successResponse(null, 'Album unliked'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Unlike album error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
