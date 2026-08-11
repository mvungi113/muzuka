import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const artist = await prisma.artist.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        songs: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, slug: true, coverPath: true, duration: true, playCount: true },
          orderBy: { playCount: 'desc' },
        },
        albums: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, slug: true, coverPath: true, releaseDate: true },
          orderBy: { releaseDate: 'desc' },
        },
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
