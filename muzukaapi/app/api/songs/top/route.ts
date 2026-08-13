import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, getPaginationParams, paginatedResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const period = searchParams.get('period') || 'all';

    let dateFilter: Date | undefined;
    if (period === 'week') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === 'year') {
      dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    }

    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (dateFilter) {
      where.createdAt = { gte: dateFilter };
    }

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        include: {
          artist: { select: { id: true, name: true, slug: true, imagePath: true } },
          album: { select: { id: true, title: true, slug: true, coverPath: true } },
          genre: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { playCount: 'desc' },
        skip,
        take: limit,
      }),
      prisma.song.count({ where }),
    ]);

    return Response.json(paginatedResponse(songs, page, limit, total));
  } catch (error) {
    console.error('Get top songs error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
