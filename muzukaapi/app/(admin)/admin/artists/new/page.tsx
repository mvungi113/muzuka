import ArtistForm from '../artist-form';

export default function NewArtistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Add New Artist</h2>
        <p className="text-neutral-500 text-sm mt-1">Create a new artist profile</p>
      </div>
      <ArtistForm />
    </div>
  );
}
