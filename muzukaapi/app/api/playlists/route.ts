import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { playlistSchema } from '@/lib/validations';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const publicOnly = searchParams.get('public') === 'true';

    const where: Record<string, unknown> = {};
    if (publicOnly) {
      where.isPublic = true;
    } else {
      where.userId = user.id;
    }

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
          playlistSongs: {
            include: {
              song: { select: { id: true, title: true, coverPath: true, duration: true } },
            },
            orderBy: { position: 'asc' },
            take: 5,
          },
          _count: { select: { playlistSongs: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.playlist.count({ where }),
    ]);

    return Response.json(paginatedResponse(playlists, page, limit, total));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Get playlists error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = playlistSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.create({
      data: { ...parsed.data, userId: user.id },
    });

    return Response.json(successResponse(playlist), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Create playlist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
