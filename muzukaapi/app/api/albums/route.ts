import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const artistId = searchParams.get('artistId');

    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (artistId) where.artistId = artistId;

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        include: {
          artist: { select: { id: true, name: true, slug: true, imagePath: true } },
          _count: { select: { songs: true } },
        },
        orderBy: { releaseDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.album.count({ where }),
    ]);

    return Response.json(paginatedResponse(albums, page, limit, total));
  } catch (error) {
    console.error('Get albums error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
