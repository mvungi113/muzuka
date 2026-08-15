import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ArtistForm from '../../artist-form';

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Edit Artist</h2>
        <p className="text-neutral-500 text-sm mt-1">Update &quot;{artist.name}&quot;</p>
      </div>
      <ArtistForm
        artist={{
          id: artist.id,
          name: artist.name,
          biography: artist.biography || undefined,
        }}
      />
    </div>
  );
}
