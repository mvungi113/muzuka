'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Artist { id: string; name: string; }
interface Album { id: string; title: string; }
interface Genre { id: string; name: string; }
interface Mood { id: string; name: string; }

interface SongFormProps {
  song?: {
    id: string;
    title: string;
    description?: string;
    artistId: string;
    albumId?: string;
    genreId?: string;
    status: string;
    releaseDate?: string;
    moodIds?: string[];
  };
}

export default function SongForm({ song }: SongFormProps) {
  const router = useRouter();
  const isEdit = !!song;

  const [title, setTitle] = useState(song?.title || '');
  const [description, setDescription] = useState(song?.description || '');
  const [artistId, setArtistId] = useState(song?.artistId || '');
  const [albumId, setAlbumId] = useState(song?.albumId || '');
  const [genreId, setGenreId] = useState(song?.genreId || '');
  const [status, setStatus] = useState(song?.status || 'DRAFT');
  const [releaseDate, setReleaseDate] = useState(song?.releaseDate?.split('T')[0] || '');
  const [moodIds, setMoodIds] = useState<string[]>(song?.moodIds || []);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/artists?limit=100').then(r => r.json()),
      fetch('/api/admin/genres?limit=100').then(r => r.json()),
      fetch('/api/admin/moods?limit=100').then(r => r.json()),
    ]).then(([artistsRes, genresRes, moodsRes]) => {
      setArtists(artistsRes.data || []);
      setGenres(genresRes.data || []);
      setMoods(moodsRes.data || []);
    });
  }, []);

  useEffect(() => {
    if (artistId) {
      fetch(`/api/admin/albums?limit=100&artistId=${artistId}`).then(r => r.json()).then(res => {
        setAlbums(res.data || []);
      });
    }
  }, [artistId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = isEdit ? `/api/admin/songs/${song!.id}` : '/api/admin/songs';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || undefined,
          artistId,
          albumId: albumId || undefined,
          genreId: genreId || undefined,
          status,
          releaseDate: releaseDate ? new Date(releaseDate).toISOString() : undefined,
          moodIds: moodIds.length > 0 ? moodIds : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to save song');
        return;
      }

      router.push('/admin/songs');
      router.refresh();
    } catch (e) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const toggleMood = (id: string) => {
    setMoodIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
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
          placeholder="Song title"
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
          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Album</label>
          <select
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">No album</option>
            {albums.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Genre</label>
          <select
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select genre</option>
            {genres.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
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

      {moods.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Moods</label>
          <div className="flex flex-wrap gap-2">
            {moods.map(mood => (
              <button
                key={mood.id}
                type="button"
                onClick={() => toggleMood(mood.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  moodIds.includes(mood.id)
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
                }`}
              >
                {mood.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Song' : 'Create Song'}
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
