import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: artistId } = await params;

    const artist = await prisma.artist.findUnique({ where: { id: artistId } });
    if (!artist) {
      return Response.json(errorResponse('Artist not found', 'ARTIST_NOT_FOUND'), { status: 404 });
    }

    const existing = await prisma.artistFollower.findUnique({
      where: { userId_artistId: { userId: user.id, artistId } },
    });

    if (existing) {
      return Response.json(errorResponse('Already following', 'ALREADY_FOLLOWING'), { status: 409 });
    }

    await prisma.artistFollower.create({
      data: { userId: user.id, artistId },
    });

    return Response.json(successResponse(null, 'Artist followed'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Follow artist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id: artistId } = await params;

    const existing = await prisma.artistFollower.findUnique({
      where: { userId_artistId: { userId: user.id, artistId } },
    });

    if (!existing) {
      return Response.json(errorResponse('Not following', 'NOT_FOLLOWING'), { status: 404 });
    }

    await prisma.artistFollower.delete({
      where: { userId_artistId: { userId: user.id, artistId } },
    });

    return Response.json(successResponse(null, 'Artist unfollowed'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Unfollow artist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
