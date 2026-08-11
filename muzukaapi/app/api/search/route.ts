import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    if (!q || q.length < 2) {
      return Response.json(errorResponse('Search query must be at least 2 characters', 'VALIDATION_ERROR'), { status: 400 });
    }

    const [songs, artists, albums, genres] = await Promise.all([
      prisma.song.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, slug: true, coverPath: true, duration: true, playCount: true, artist: { select: { id: true, name: true, slug: true } } },
        take: limit,
      }),
      prisma.artist.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, slug: true, imagePath: true, _count: { select: { songs: true } } },
        take: limit,
      }),
      prisma.album.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, title: true, slug: true, coverPath: true, artist: { select: { id: true, name: true } }, _count: { select: { songs: true } } },
        take: limit,
      }),
      prisma.genre.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        select: { id: true, name: true, slug: true, _count: { select: { songs: true } } },
        take: limit,
      }),
    ]);

    return Response.json(
      successResponse({ songs, artists, albums, genres })
    );
  } catch (error) {
    console.error('Search error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
