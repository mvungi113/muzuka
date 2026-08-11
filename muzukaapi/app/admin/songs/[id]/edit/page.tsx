import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SongForm from '../../song-form';

export default async function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      songMoods: { select: { moodId: true } },
    },
  });

  if (!song) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Edit Song</h2>
        <p className="text-neutral-500 text-sm mt-1">Update &quot;{song.title}&quot;</p>
      </div>
      <SongForm
        song={{
          id: song.id,
          title: song.title,
          description: song.description || undefined,
          artistId: song.artistId,
          albumId: song.albumId || undefined,
          genreId: song.genreId || undefined,
          status: song.status,
          releaseDate: song.releaseDate?.toISOString(),
          moodIds: song.songMoods.map(m => m.moodId),
        }}
      />
    </div>
  );
}
