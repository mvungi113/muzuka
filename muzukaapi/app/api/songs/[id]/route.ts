import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const song = await prisma.song.findUnique({
      where: { id },
      include: {
        artist: { select: { id: true, name: true, slug: true, imagePath: true, biography: true } },
        album: { select: { id: true, title: true, slug: true, coverPath: true, releaseDate: true } },
        genre: { select: { id: true, name: true, slug: true } },
        songMoods: { include: { mood: true } },
        _count: {
          select: { songLikes: true, listeningHistory: true, downloads: true },
        },
      },
    });

    if (!song) {
      return Response.json(errorResponse('Song not found', 'SONG_NOT_FOUND'), { status: 404 });
    }

    let isLiked = false;
    if (user) {
      const like = await prisma.songLike.findUnique({
        where: { userId_songId: { userId: user.id, songId: id } },
      });
      isLiked = !!like;
    }

    return Response.json(successResponse({ ...song, isLiked }));
  } catch (error) {
    console.error('Get song error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
