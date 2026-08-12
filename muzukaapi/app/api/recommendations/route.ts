import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')));

    const recentlyPlayed = await prisma.listeningHistory.findMany({
      where: { userId: user.id },
      select: { songId: true },
      orderBy: { playedAt: 'desc' },
      take: 20,
    });
    const recentSongIds = recentlyPlayed.map((h) => h.songId);

    const recentSongs = recentSongIds.length > 0
      ? await prisma.song.findMany({
          where: { id: { in: recentSongIds } },
          select: { genreId: true, artistId: true, songMoods: { select: { moodId: true } } },
        })
      : [];

    const genreIds = [...new Set(recentSongs.map((s) => s.genreId).filter(Boolean))] as string[];
    const artistIds = [...new Set(recentSongs.map((s) => s.artistId))] as string[];
    const moodIds = [
      ...new Set(recentSongs.flatMap((s) => s.songMoods.map((m) => m.moodId))),
    ];

    const [
      basedOnGenre,
      basedOnArtist,
      basedOnMood,
      madeForYou,
      recentlyPlayedSongs,
    ] = await Promise.all([
      genreIds.length > 0
        ? prisma.song.findMany({
            where: {
              status: 'PUBLISHED',
              genreId: { in: genreIds },
              id: { notIn: recentSongIds },
            },
            include: {
              artist: { select: { id: true, name: true, slug: true, imagePath: true } },
              genre: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { playCount: 'desc' },
            take: limit,
          })
        : [],
      artistIds.length > 0
        ? prisma.song.findMany({
            where: {
              status: 'PUBLISHED',
              artistId: { in: artistIds },
              id: { notIn: recentSongIds },
            },
            include: {
              artist: { select: { id: true, name: true, slug: true, imagePath: true } },
              genre: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { playCount: 'desc' },
            take: limit,
          })
        : [],
      moodIds.length > 0
        ? prisma.song.findMany({
            where: {
              status: 'PUBLISHED',
              songMoods: { some: { moodId: { in: moodIds } } },
              id: { notIn: recentSongIds },
            },
            include: {
              artist: { select: { id: true, name: true, slug: true, imagePath: true } },
              genre: { select: { id: true, name: true, slug: true } },
              songMoods: { include: { mood: true } },
            },
            orderBy: { playCount: 'desc' },
            take: limit,
          })
        : [],
      prisma.song.findMany({
        where: {
          status: 'PUBLISHED',
          id: { notIn: recentSongIds },
        },
        include: {
          artist: { select: { id: true, name: true, slug: true, imagePath: true } },
          genre: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { playCount: 'desc' },
        take: limit,
      }),
      recentSongIds.length > 0
        ? prisma.song.findMany({
            where: { id: { in: recentSongIds }, status: 'PUBLISHED' },
            include: {
              artist: { select: { id: true, name: true, slug: true, imagePath: true } },
              genre: { select: { id: true, name: true, slug: true } },
            },
          })
        : [],
    ]);

    return Response.json(
      successResponse({
        recentlyPlayed: recentlyPlayedSongs,
        madeForYou,
        basedOnGenre,
        basedOnArtist,
        basedOnMood,
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Recommendations error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
