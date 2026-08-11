'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Artist { id: string; name: string; }

interface AlbumFormProps {
  album?: {
    id: string;
    title: string;
    description?: string;
    artistId: string;
    status: string;
    releaseDate?: string;
  };
}

export default function AlbumForm({ album }: AlbumFormProps) {
  const router = useRouter();
  const isEdit = !!album;

  const [title, setTitle] = useState(album?.title || '');
  const [description, setDescription] = useState(album?.description || '');
  const [artistId, setArtistId] = useState(album?.artistId || '');
  const [status, setStatus] = useState(album?.status || 'DRAFT');
  const [releaseDate, setReleaseDate] = useState(album?.releaseDate?.split('T')[0] || '');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/artists?limit=100').then(r => r.json()).then(res => {
      setArtists(res.data || []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = isEdit ? `/api/admin/albums/${album!.id}` : '/api/admin/albums';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || undefined,
          artistId,
          status,
          releaseDate: releaseDate ? new Date(releaseDate).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to save album');
        return;
      }

      router.push('/admin/albums');
      router.refresh();
    } catch {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="Album title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Artist *</label>
          <select
            value={artistId}
            onChange={(e) => setArtistId(e.target.value)}
            required
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select artist</option>
            {artists.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="UNPUBLISHED">Unpublished</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Release Date</label>
        <input
          type="date"
          value={releaseDate}
          onChange={(e) => setReleaseDate(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Album' : 'Create Album'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
