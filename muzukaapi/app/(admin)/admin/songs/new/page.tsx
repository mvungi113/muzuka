import SongForm from '../song-form';

export default function NewSongPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Add New Song</h2>
        <p className="text-neutral-500 text-sm mt-1">Create a new song entry</p>
      </div>
      <SongForm />
    </div>
  );
}
