import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [likes, total] = await Promise.all([
      prisma.songLike.findMany({
        where: { userId: user.id },
        include: {
          song: {
            include: {
              artist: { select: { id: true, name: true, slug: true, imagePath: true } },
              album: { select: { id: true, title: true, slug: true, coverPath: true } },
              genre: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.songLike.count({ where: { userId: user.id } }),
    ]);

    const songs = likes.map((like) => like.song);
    return Response.json(paginatedResponse(songs, page, limit, total));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Get liked songs error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
