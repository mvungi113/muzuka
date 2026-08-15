import AlbumForm from '../album-form';

export default function NewAlbumPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Add New Album</h2>
        <p className="text-neutral-500 text-sm mt-1">Create a new album</p>
      </div>
      <AlbumForm />
    </div>
  );
}
