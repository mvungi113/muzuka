import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { artistSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        songs: { select: { id: true, title: true, slug: true, status: true, playCount: true } },
        albums: { select: { id: true, title: true, slug: true, status: true } },
        _count: { select: { songs: true, albums: true, followers: true } },
      },
    });

    if (!artist) {
      return Response.json(errorResponse('Artist not found', 'ARTIST_NOT_FOUND'), { status: 404 });
    }

    return Response.json(successResponse(artist));
  } catch (error) {
    console.error('Get artist error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = artistSchema.partial().safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const existing = await prisma.artist.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Artist not found', 'ARTIST_NOT_FOUND'), { status: 404 });
    }

    const artist = await prisma.artist.update({
      where: { id },
      data: parsed.data,
    });

    return Response.json(successResponse(artist));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Update artist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.artist.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Artist not found', 'ARTIST_NOT_FOUND'), { status: 404 });
    }

    await prisma.artist.delete({ where: { id } });
    return Response.json(successResponse(null, 'Artist deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Delete artist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
