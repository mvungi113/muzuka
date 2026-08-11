import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getArtists() {
  const artists = await prisma.artist.findMany({
    include: {
      _count: { select: { songs: true, albums: true, followers: true } },
    },
    orderBy: { name: 'asc' },
  });
  return artists;
}

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Artists</h2>
          <p className="text-neutral-500 text-sm mt-1">{artists.length} artists</p>
        </div>
        <Link
          href="/admin/artists/new"
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Artist
        </Link>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Slug</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Songs</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Albums</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Followers</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {artists.map((artist) => (
              <tr key={artist.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-violet-400">
                      {artist.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{artist.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-neutral-500">{artist.slug}</td>
                <td className="px-5 py-4 text-sm text-neutral-400 text-right">{artist._count.songs}</td>
                <td className="px-5 py-4 text-sm text-neutral-400 text-right">{artist._count.albums}</td>
                <td className="px-5 py-4 text-sm text-neutral-400 text-right">{artist._count.followers}</td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/admin/artists/${artist.id}/edit`} className="text-violet-400 hover:text-violet-300 text-sm">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {artists.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            <p className="text-lg">No artists yet</p>
            <p className="text-sm mt-1">Add your first artist to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
