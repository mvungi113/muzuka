import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { albumSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        artist: { select: { id: true, name: true, slug: true } },
        songs: { select: { id: true, title: true, slug: true, status: true, duration: true, playCount: true } },
        _count: { select: { songs: true, albumLikes: true } },
      },
    });

    if (!album) {
      return Response.json(errorResponse('Album not found', 'ALBUM_NOT_FOUND'), { status: 404 });
    }

    return Response.json(successResponse(album));
  } catch (error) {
    console.error('Get album error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = albumSchema.partial().safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const existing = await prisma.album.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Album not found', 'ALBUM_NOT_FOUND'), { status: 404 });
    }

    const album = await prisma.album.update({
      where: { id },
      data: parsed.data,
      include: {
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    return Response.json(successResponse(album));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Update album error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.album.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Album not found', 'ALBUM_NOT_FOUND'), { status: 404 });
    }

    await prisma.album.delete({ where: { id } });
    return Response.json(successResponse(null, 'Album deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Delete album error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
