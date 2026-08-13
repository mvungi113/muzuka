import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [items, total] = await Promise.all([
      prisma.recentlyPlayed.findMany({
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
        orderBy: { playedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.recentlyPlayed.count({ where: { userId: user.id } }),
    ]);

    const songs = items.map((item) => item.song);
    return Response.json(paginatedResponse(songs, page, limit, total));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Get recently played error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
