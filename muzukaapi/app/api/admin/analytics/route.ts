import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    let dateFilter: Date;
    switch (period) {
      case '24h':
        dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      totalSongs,
      totalArtists,
      totalAlbums,
      totalUsers,
      publishedSongs,
      totalPlays,
      recentPlays,
      recentLikes,
      recentDownloads,
      newUsers,
      topSongs,
      topArtists,
      recentActivity,
      playsByDay,
    ] = await Promise.all([
      prisma.song.count(),
      prisma.artist.count(),
      prisma.album.count(),
      prisma.user.count(),
      prisma.song.count({ where: { status: 'PUBLISHED' } }),
      prisma.song.aggregate({ _sum: { playCount: true } }),
      prisma.listeningHistory.count({ where: { playedAt: { gte: dateFilter } } }),
      prisma.songLike.count({ where: { createdAt: { gte: dateFilter } } }),
      prisma.download.count({ where: { downloadedAt: { gte: dateFilter } } }),
      prisma.user.count({ where: { createdAt: { gte: dateFilter } } }),
      prisma.song.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          playCount: true,
          artist: { select: { id: true, name: true } },
        },
        orderBy: { playCount: 'desc' },
        take: 10,
      }),
      prisma.artist.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { songs: true, followers: true } },
          songs: {
            select: { playCount: true },
            where: { status: 'PUBLISHED' },
          },
        },
        orderBy: { name: 'asc' },
        take: 10,
      }),
      prisma.listeningHistory.findMany({
        include: {
          user: { select: { id: true, name: true } },
          song: { select: { id: true, title: true, artist: { select: { name: true } } } },
        },
        orderBy: { playedAt: 'desc' },
        take: 20,
      }),
      prisma.$queryRaw`
        SELECT
          DATE("playedAt") as date,
          COUNT(*)::int as plays
        FROM "ListeningHistory"
        WHERE "playedAt" >= ${dateFilter}
        GROUP BY DATE("playedAt")
        ORDER BY date ASC
      `,
    ]);

    const topArtistsWithPlays = topArtists
      .map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        songCount: a._count.songs,
        followerCount: a._count.followers,
        totalPlays: a.songs.reduce((sum, s) => sum + s.playCount, 0),
      }))
      .sort((a, b) => b.totalPlays - a.totalPlays);

    return Response.json(
      successResponse({
        overview: {
          totalSongs,
          totalArtists,
          totalAlbums,
          totalUsers,
          publishedSongs,
          totalPlays: totalPlays._sum.playCount ?? 0,
        },
        period: {
          label: period,
          plays: recentPlays,
          likes: recentLikes,
          downloads: recentDownloads,
          newUsers,
        },
        topSongs,
        topArtists: topArtistsWithPlays,
        recentActivity,
        playsByDay,
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Analytics error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
