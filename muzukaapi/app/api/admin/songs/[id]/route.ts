import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { songSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = songSchema.partial().safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const existing = await prisma.song.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Song not found', 'SONG_NOT_FOUND'), { status: 404 });
    }

    const { moodIds, ...data } = parsed.data;

    const song = await prisma.song.update({
      where: { id },
      data: {
        ...data,
        ...(moodIds !== undefined && {
          songMoods: {
            deleteMany: {},
            create: moodIds.map((moodId) => ({ moodId })),
          },
        }),
      },
      include: {
        artist: { select: { id: true, name: true, slug: true } },
        album: { select: { id: true, title: true, slug: true } },
        genre: { select: { id: true, name: true, slug: true } },
        songMoods: { include: { mood: true } },
      },
    });

    return Response.json(successResponse(song));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Update song error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.song.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Song not found', 'SONG_NOT_FOUND'), { status: 404 });
    }

    await prisma.song.delete({ where: { id } });
    return Response.json(successResponse(null, 'Song deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Delete song error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
