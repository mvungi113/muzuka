import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getAlbums() {
  const albums = await prisma.album.findMany({
    include: {
      artist: { select: { name: true } },
      _count: { select: { songs: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return albums;
}

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Albums</h2>
          <p className="text-neutral-500 text-sm mt-1">{albums.length} albums</p>
        </div>
        <Link
          href="/admin/albums/new"
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Album
        </Link>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Title</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Artist</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Songs</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Release Date</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {albums.map((album) => (
              <tr key={album.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-5 py-4 text-sm font-medium">{album.title}</td>
                <td className="px-5 py-4 text-sm text-neutral-400">{album.artist.name}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    album.status === 'PUBLISHED' ? 'bg-green-900 text-green-300' :
                    album.status === 'DRAFT' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {album.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-neutral-400 text-right">{album._count.songs}</td>
                <td className="px-5 py-4 text-sm text-neutral-500">
                  {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/admin/albums/${album.id}/edit`} className="text-violet-400 hover:text-violet-300 text-sm">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {albums.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            <p className="text-lg">No albums yet</p>
            <p className="text-sm mt-1">Create your first album to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
