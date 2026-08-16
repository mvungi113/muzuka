import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mood = await prisma.mood.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        songMoods: {
          include: {
            song: {
              select: { id: true, title: true, slug: true, coverPath: true, duration: true, playCount: true },
            },
          },
        },
        _count: { select: { songMoods: true } },
      },
    });

    if (!mood) {
      return Response.json(errorResponse('Mood not found', 'MOOD_NOT_FOUND'), { status: 404 });
    }

    return Response.json(successResponse(mood));
  } catch (error) {
    console.error('Get mood error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
