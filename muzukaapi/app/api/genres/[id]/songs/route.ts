import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: genreId } = await params;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const genre = await prisma.genre.findUnique({ where: { id: genreId } });
    if (!genre) {
      return Response.json(errorResponse('Genre not found', 'GENRE_NOT_FOUND'), { status: 404 });
    }

    const where = { genreId, status: 'PUBLISHED' as const };

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
    console.error('Get genre songs error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
