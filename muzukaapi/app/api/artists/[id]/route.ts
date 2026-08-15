import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

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

    let isFollowing = false;
    if (user) {
      const follow = await prisma.artistFollower.findUnique({
        where: { userId_artistId: { userId: user.id, artistId: artist.id } },
      });
      isFollowing = !!follow;
    }

    return Response.json(successResponse({ ...artist, isFollowing }));
  } catch (error) {
    console.error('Get artist error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
