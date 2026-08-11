import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get('status') || 'PUBLISHED';
    const genreId = searchParams.get('genreId');
    const artistId = searchParams.get('artistId');

    const where: Record<string, unknown> = { status };
    if (genreId) where.genreId = genreId;
    if (artistId) where.artistId = artistId;

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        where,
        include: {
          artist: { select: { id: true, name: true, slug: true, imagePath: true } },
          album: { select: { id: true, title: true, slug: true, coverPath: true } },
          genre: { select: { id: true, name: true, slug: true } },
          songMoods: { include: { mood: { select: { id: true, name: true, slug: true, color: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.song.count({ where }),
    ]);

    return Response.json(paginatedResponse(songs, page, limit, total));
  } catch (error) {
    console.error('Get songs error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
