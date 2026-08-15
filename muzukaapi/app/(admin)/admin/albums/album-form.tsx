'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

async function uploadFile(file: File, type: string): Promise<{ path: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

interface Artist { id: string; name: string; }

interface AlbumFormProps {
  album?: {
    id: string;
    title: string;
    description?: string;
    artistId: string;
    status: string;
    releaseDate?: string;
    coverPath?: string;
  };
}

export default function AlbumForm({ album }: AlbumFormProps) {
  const router = useRouter();
  const isEdit = !!album;
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(album?.title || '');
  const [description, setDescription] = useState(album?.description || '');
  const [artistId, setArtistId] = useState(album?.artistId || '');
  const [status, setStatus] = useState(album?.status || 'DRAFT');
  const [releaseDate, setReleaseDate] = useState(album?.releaseDate?.split('T')[0] || '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPath, setCoverPath] = useState(album?.coverPath || '');
  const [coverPreview, setCoverPreview] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/artists?limit=100').then(r => r.json()).then(res => {
      setArtists(res.data || []);
    });
  }, []);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let finalCoverPath = coverPath;
      if (coverFile) {
        const result = await uploadFile(coverFile, 'album-image');
        finalCoverPath = result.path;
      }

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
          coverPath: finalCoverPath || undefined,
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
        <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="Album title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="Optional description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Cover Image</label>
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
        <div
          onClick={() => coverInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="" className="w-40 h-40 mx-auto rounded-lg object-cover" />
          ) : coverPath ? (
            <div className="text-sm text-green-400">✓ Cover image uploaded</div>
          ) : (
            <>
              <div className="text-3xl mb-2">🖼️</div>
              <div className="text-sm text-neutral-400">Click to upload cover image</div>
            </>
          )}
        </div>
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
