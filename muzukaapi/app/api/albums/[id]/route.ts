import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const album = await prisma.album.findFirst({
      where: { OR: [{ id }, { slug: id }], status: 'PUBLISHED' },
      include: {
        artist: { select: { id: true, name: true, slug: true, imagePath: true } },
        songs: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true, slug: true, coverPath: true, duration: true, playCount: true },
          orderBy: { createdAt: 'asc' },
        },
        _count: { select: { songs: true } },
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
