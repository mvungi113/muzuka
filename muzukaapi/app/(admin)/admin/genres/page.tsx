'use client';

import { useState, useEffect } from 'react';

interface Genre { id: string; name: string; slug: string; _count: { songs: number }; }

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGenres();
  }, []);

  async function fetchGenres() {
    const res = await fetch('/api/admin/genres?limit=100');
    const data = await res.json();
    setGenres(data.data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    const res = await fetch('/api/admin/genres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setNewName('');
      fetchGenres();
    }
  }

  async function handleUpdate(id: string) {
    const res = await fetch(`/api/genres/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    const data = await res.json();
    if (data.success) {
      setEditingId(null);
      fetchGenres();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this genre?')) return;
    await fetch(`/api/genres/${id}`, { method: 'DELETE' });
    fetchGenres();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Genres</h2>
        <p className="text-neutral-500 text-sm mt-1">{genres.length} genres</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 max-w-md">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New genre name"
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          Add
        </button>
      </form>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading...</div>
        ) : genres.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No genres yet</div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {genres.map((genre) => (
              <div key={genre.id} className="flex items-center gap-4 px-5 py-3">
                {editingId === genre.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(genre.id)} className="text-green-400 text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-neutral-500 text-sm">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{genre.name}</span>
                    <span className="text-xs text-neutral-500">{genre._count.songs} songs</span>
                    <button
                      onClick={() => { setEditingId(genre.id); setEditName(genre.name); }}
                      className="text-violet-400 text-sm"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(genre.id)} className="text-red-400 text-sm">Delete</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
