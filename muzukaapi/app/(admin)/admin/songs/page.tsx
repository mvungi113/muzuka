import Link from 'next/link';
import prisma from '@/lib/prisma';
import { paginatedResponse } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

async function getSongs(searchParams: { page?: string }) {
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      include: {
        artist: { select: { name: true } },
        genre: { select: { name: true } },
        _count: { select: { songLikes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.song.count(),
  ]);

  return { songs, total, page, totalPages: Math.ceil(total / limit) };
}

export default async function SongsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const { songs, total, page, totalPages } = await getSongs(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Songs</h2>
          <p className="text-neutral-500 text-sm mt-1">{total} total songs</p>
        </div>
        <Link
          href="/admin/songs/new"
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Song
        </Link>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Title</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Artist</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Genre</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Plays</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Likes</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {songs.map((song) => (
              <tr key={song.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-sm">
                      🎵
                    </div>
                    <div>
                      <div className="text-sm font-medium">{song.title}</div>
                      <div className="text-xs text-neutral-500">{song.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-neutral-400">{song.artist.name}</td>
                <td className="px-5 py-4 text-sm text-neutral-400">{song.genre?.name || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    song.status === 'PUBLISHED' ? 'bg-green-900 text-green-300' :
                    song.status === 'DRAFT' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {song.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-neutral-400 text-right">{song.playCount.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-neutral-400 text-right">{song._count.songLikes}</td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/songs/${song.id}/edit`}
                    className="text-violet-400 hover:text-violet-300 text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {songs.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            <p className="text-lg">No songs yet</p>
            <p className="text-sm mt-1">Upload your first song to get started</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`/admin/songs?page=${page - 1}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 text-sm hover:bg-neutral-700">
              Previous
            </Link>
          )}
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/songs?page=${page + 1}`} className="px-3 py-1.5 rounded-lg bg-neutral-800 text-sm hover:bg-neutral-700">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
