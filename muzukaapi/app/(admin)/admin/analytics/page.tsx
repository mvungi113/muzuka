'use client';

import { useState, useEffect } from 'react';

interface Analytics {
  overview: {
    totalSongs: number;
    totalArtists: number;
    totalAlbums: number;
    totalUsers: number;
    publishedSongs: number;
    totalPlays: number;
  };
  period: {
    label: string;
    plays: number;
    likes: number;
    downloads: number;
    newUsers: number;
  };
  topSongs: Array<{
    id: string;
    title: string;
    playCount: number;
    artist: { name: string };
  }>;
  topArtists: Array<{
    id: string;
    name: string;
    songCount: number;
    followerCount: number;
    totalPlays: number;
  }>;
  recentActivity: Array<{
    id: string;
    playedAt: string;
    user: { name: string };
    song: { title: string; artist: { name: string } };
  }>;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?period=${period}`)
      .then(r => r.json())
      .then(data => {
        setAnalytics(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) {
    return <div className="text-center py-12 text-neutral-500">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12 text-neutral-500">Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-neutral-500 text-sm mt-1">Platform performance</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                period === p
                  ? 'bg-violet-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Plays', value: analytics.overview.totalPlays.toLocaleString(), icon: '▶️' },
          { label: 'Period Plays', value: analytics.period.plays.toLocaleString(), icon: '📈' },
          { label: 'Likes', value: analytics.period.likes.toLocaleString(), icon: '❤️' },
          { label: 'Downloads', value: analytics.period.downloads.toLocaleString(), icon: '⬇️' },
          { label: 'New Users', value: analytics.period.newUsers.toLocaleString(), icon: '👤' },
          { label: 'Published', value: analytics.overview.publishedSongs.toString(), icon: '🎵' },
        ].map(card => (
          <div key={card.label} className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
            <div className="text-lg">{card.icon}</div>
            <div className="text-2xl font-bold mt-1">{card.value}</div>
            <div className="text-xs text-neutral-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800">
          <div className="p-5 border-b border-neutral-800">
            <h3 className="font-semibold">Top Songs</h3>
          </div>
          <div className="divide-y divide-neutral-800 max-h-80 overflow-auto">
            {analytics.topSongs.map((song, i) => (
              <div key={song.id} className="flex items-center gap-4 p-4">
                <span className="text-neutral-500 text-sm w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{song.title}</div>
                  <div className="text-xs text-neutral-500">{song.artist.name}</div>
                </div>
                <div className="text-sm text-neutral-400">{song.playCount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800">
          <div className="p-5 border-b border-neutral-800">
            <h3 className="font-semibold">Top Artists</h3>
          </div>
          <div className="divide-y divide-neutral-800 max-h-80 overflow-auto">
            {analytics.topArtists.map((artist, i) => (
              <div key={artist.id} className="flex items-center gap-4 p-4">
                <span className="text-neutral-500 text-sm w-5">{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
                  {artist.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{artist.name}</div>
                  <div className="text-xs text-neutral-500">{artist.songCount} songs · {artist.followerCount} followers</div>
                </div>
                <div className="text-sm text-neutral-400">{artist.totalPlays.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        <div className="p-5 border-b border-neutral-800">
          <h3 className="font-semibold">Recent Activity</h3>
        </div>
        <div className="divide-y divide-neutral-800 max-h-80 overflow-auto">
          {analytics.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4 p-4">
              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">
                {activity.user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>
                  <span className="text-neutral-500"> played </span>
                  <span className="font-medium">{activity.song.title}</span>
                </div>
                <div className="text-xs text-neutral-500">
                  {activity.song.artist.name} · {new Date(activity.playedAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
