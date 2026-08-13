import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [follows, total] = await Promise.all([
      prisma.artistFollower.findMany({
        where: { userId: user.id },
        include: {
          artist: {
            include: {
              _count: { select: { followers: true, songs: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.artistFollower.count({ where: { userId: user.id } }),
    ]);

    const artists = follows.map((follow) => follow.artist);
    return Response.json(paginatedResponse(artists, page, limit, total));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Get followed artists error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
