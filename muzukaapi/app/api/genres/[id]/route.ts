import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { genreSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const genre = await prisma.genre.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        songs: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, slug: true, coverPath: true, playCount: true },
          orderBy: { playCount: 'desc' },
          take: 20,
        },
        _count: { select: { songs: true } },
      },
    });

    if (!genre) {
      return Response.json(errorResponse('Genre not found', 'GENRE_NOT_FOUND'), { status: 404 });
    }

    return Response.json(successResponse(genre));
  } catch (error) {
    console.error('Get genre error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = genreSchema.partial().safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const existing = await prisma.genre.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Genre not found', 'GENRE_NOT_FOUND'), { status: 404 });
    }

    const genre = await prisma.genre.update({ where: { id }, data: parsed.data });
    return Response.json(successResponse(genre));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Update genre error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.genre.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Genre not found', 'GENRE_NOT_FOUND'), { status: 404 });
    }

    await prisma.genre.delete({ where: { id } });
    return Response.json(successResponse(null, 'Genre deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Delete genre error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
