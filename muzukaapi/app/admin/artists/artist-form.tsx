'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ArtistFormProps {
  artist?: {
    id: string;
    name: string;
    biography?: string;
  };
}

export default function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const isEdit = !!artist;

  const [name, setName] = useState(artist?.name || '');
  const [biography, setBiography] = useState(artist?.biography || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = isEdit ? `/api/admin/artists/${artist!.id}` : '/api/admin/artists';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, biography: biography || undefined }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to save artist');
        return;
      }

      router.push('/admin/artists');
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
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="Artist name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Biography</label>
        <textarea
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          rows={4}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="Artist biography"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Artist' : 'Create Artist'}
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
