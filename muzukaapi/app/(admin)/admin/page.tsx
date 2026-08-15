import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [totalSongs, totalArtists, totalAlbums, totalUsers, publishedSongs] = await Promise.all([
    prisma.song.count(),
    prisma.artist.count(),
    prisma.album.count(),
    prisma.user.count(),
    prisma.song.count({ where: { status: 'PUBLISHED' } }),
  ]);

  const topSongs = await prisma.song.findMany({
    where: { status: 'PUBLISHED' },
    include: { artist: { select: { name: true } } },
    orderBy: { playCount: 'desc' },
    take: 5,
  });

  const recentSongs = await prisma.song.findMany({
    include: { artist: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    totalSongs,
    totalArtists,
    totalAlbums,
    totalUsers,
    publishedSongs,
    topSongs,
    recentSongs,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: 'Total Songs', value: stats.totalSongs, icon: '🎵', color: 'bg-violet-600' },
    { label: 'Published', value: stats.publishedSongs, icon: '✅', color: 'bg-green-600' },
    { label: 'Artists', value: stats.totalArtists, icon: '🎤', color: 'bg-blue-600' },
    { label: 'Albums', value: stats.totalAlbums, icon: '💿', color: 'bg-orange-600' },
    { label: 'Users', value: stats.totalUsers, icon: '👥', color: 'bg-pink-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-neutral-500 text-sm mt-1">Overview of your music platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-neutral-900 rounded-xl p-5 border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className={`${card.color} text-white text-xs font-medium px-2 py-0.5 rounded-full`}>
                Live
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm text-neutral-500 mt-1">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800">
          <div className="p-5 border-b border-neutral-800">
            <h3 className="font-semibold">Top Songs by Plays</h3>
          </div>
          <div className="divide-y divide-neutral-800">
            {stats.topSongs.length === 0 ? (
              <div className="p-5 text-neutral-500 text-sm">No songs yet</div>
            ) : (
              stats.topSongs.map((song, i) => (
                <div key={song.id} className="flex items-center gap-4 p-4">
                  <span className="text-neutral-500 text-sm w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{song.title}</div>
                    <div className="text-xs text-neutral-500 truncate">{song.artist.name}</div>
                  </div>
                  <div className="text-sm text-neutral-400">{song.playCount.toLocaleString()} plays</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800">
          <div className="p-5 border-b border-neutral-800">
            <h3 className="font-semibold">Recent Uploads</h3>
          </div>
          <div className="divide-y divide-neutral-800">
            {stats.recentSongs.length === 0 ? (
              <div className="p-5 text-neutral-500 text-sm">No songs yet</div>
            ) : (
              stats.recentSongs.map((song) => (
                <div key={song.id} className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500">
                    🎵
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{song.title}</div>
                    <div className="text-xs text-neutral-500 truncate">{song.artist.name}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    song.status === 'PUBLISHED' ? 'bg-green-900 text-green-300' :
                    song.status === 'DRAFT' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {song.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
