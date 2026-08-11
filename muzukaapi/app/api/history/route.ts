import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { historySchema } from '@/lib/validations';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = historySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { songId, durationPlayed, completed } = parsed.data;

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return Response.json(errorResponse('Song not found', 'SONG_NOT_FOUND'), { status: 404 });
    }

    await prisma.$transaction([
      prisma.listeningHistory.create({
        data: {
          userId: user.id,
          songId,
          durationPlayed,
          completed: completed ?? false,
        },
      }),
      prisma.song.update({
        where: { id: songId },
        data: { playCount: { increment: 1 } },
      }),
      prisma.recentlyPlayed.upsert({
        where: { userId_songId: { userId: user.id, songId } },
        update: { playedAt: new Date() },
        create: { userId: user.id, songId },
      }),
    ]);

    return Response.json(successResponse(null, 'History recorded'), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Record history error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [history, total] = await Promise.all([
      prisma.listeningHistory.findMany({
        where: { userId: user.id },
        include: {
          song: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverPath: true,
              duration: true,
              artist: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { playedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.listeningHistory.count({ where: { userId: user.id } }),
    ]);

    return Response.json(paginatedResponse(history, page, limit, total));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Get history error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
