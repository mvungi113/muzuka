import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { songSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';
import { uniqueSlug } from '@/lib/slug';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = songSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { moodIds, ...data } = parsed.data;

    const slug = await uniqueSlug(data.title, async (s) => {
      const existing = await prisma.song.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const song = await prisma.song.create({
      data: {
        ...data,
        slug,
        moodIds: moodIds?.length
          ? { create: moodIds.map((moodId) => ({ moodId })) }
          : undefined,
      },
      include: {
        artist: { select: { id: true, name: true, slug: true } },
        album: { select: { id: true, title: true, slug: true } },
        genre: { select: { id: true, name: true, slug: true } },
        songMoods: { include: { mood: true } },
      },
    });

    return Response.json(successResponse(song), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Create song error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
