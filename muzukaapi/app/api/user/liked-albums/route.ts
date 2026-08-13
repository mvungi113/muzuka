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
      prisma.albumLike.findMany({
        where: { userId: user.id },
        include: {
          album: {
            include: {
              artist: { select: { id: true, name: true, slug: true, imagePath: true } },
              _count: { select: { songs: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.albumLike.count({ where: { userId: user.id } }),
    ]);

    const albums = likes.map((like) => like.album);
    return Response.json(paginatedResponse(albums, page, limit, total));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Get liked albums error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
