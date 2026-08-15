import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AlbumForm from '../../album-form';

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const album = await prisma.album.findUnique({ where: { id } });
  if (!album) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Edit Album</h2>
        <p className="text-neutral-500 text-sm mt-1">Update &quot;{album.title}&quot;</p>
      </div>
      <AlbumForm
        album={{
          id: album.id,
          title: album.title,
          description: album.description || undefined,
          artistId: album.artistId,
          status: album.status,
          releaseDate: album.releaseDate?.toISOString(),
        }}
      />
    </div>
  );
}
