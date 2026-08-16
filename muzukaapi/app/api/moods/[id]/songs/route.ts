import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: moodId } = await params;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const mood = await prisma.mood.findUnique({ where: { id: moodId } });
    if (!mood) {
      return Response.json(errorResponse('Mood not found', 'MOOD_NOT_FOUND'), { status: 404 });
    }

    const [songMoods, total] = await Promise.all([
      prisma.songMood.findMany({
        where: { moodId },
        include: {
          song: {
            include: {
              artist: { select: { id: true, name: true, slug: true, imagePath: true } },
              album: { select: { id: true, title: true, slug: true, coverPath: true } },
              genre: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { song: { playCount: 'desc' } },
        skip,
        take: limit,
      }),
      prisma.songMood.count({ where: { moodId } }),
    ]);

    const songs = songMoods.map((sm) => sm.song);
    return Response.json(paginatedResponse(songs, page, limit, total));
  } catch (error) {
    console.error('Get mood songs error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
