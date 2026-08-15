'use client';

import { useState, useEffect, useRef } from 'react';
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
    audioPath?: string;
    coverPath?: string;
  };
}

async function uploadFile(file: File, type: string): Promise<{ path: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.data;
}

export default function SongForm({ song }: SongFormProps) {
  const router = useRouter();
  const isEdit = !!song;
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(song?.title || '');
  const [description, setDescription] = useState(song?.description || '');
  const [artistId, setArtistId] = useState(song?.artistId || '');
  const [albumId, setAlbumId] = useState(song?.albumId || '');
  const [genreId, setGenreId] = useState(song?.genreId || '');
  const [status, setStatus] = useState(song?.status || 'DRAFT');
  const [releaseDate, setReleaseDate] = useState(song?.releaseDate?.split('T')[0] || '');
  const [moodIds, setMoodIds] = useState<string[]>(song?.moodIds || []);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioPath, setAudioPath] = useState(song?.audioPath || '');
  const [coverPath, setCoverPath] = useState(song?.coverPath || '');
  const [audioPreview, setAudioPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
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

  function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setAudioPreview(file.name);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let finalAudioPath = audioPath;
      let finalCoverPath = coverPath;

      if (audioFile) {
        setUploadProgress('Uploading audio...');
        setUploading(true);
        const result = await uploadFile(audioFile, 'song');
        finalAudioPath = result.path;
        setUploading(false);
      }

      if (coverFile) {
        setUploadProgress('Uploading cover...');
        setUploading(true);
        const result = await uploadFile(coverFile, 'cover');
        finalCoverPath = result.path;
        setUploading(false);
      }

      setUploadProgress('Saving song...');

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
          audioPath: finalAudioPath || undefined,
          coverPath: finalCoverPath || undefined,
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
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setSaving(false);
      setUploading(false);
      setUploadProgress('');
    }
  };

  const toggleMood = (id: string) => {
    setMoodIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {(error || uploadProgress) && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          error ? 'bg-red-900/50 border border-red-800 text-red-300' : 'bg-violet-900/50 border border-violet-800 text-violet-300'
        }`}>
          {error || uploadProgress}
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

      {/* Audio File Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Audio File {!isEdit && '*'}</label>
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={handleAudioChange}
          className="hidden"
        />
        <div
          onClick={() => audioInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
        >
          {audioPreview ? (
            <div className="text-sm text-green-400">✓ {audioPreview}</div>
          ) : audioPath ? (
            <div className="text-sm text-green-400">✓ Audio file uploaded</div>
          ) : (
            <>
              <div className="text-3xl mb-2">🎵</div>
              <div className="text-sm text-neutral-400">Click to upload audio file</div>
              <div className="text-xs text-neutral-600 mt-1">MP3, WAV, OGG, AAC, M4A (max 50MB)</div>
            </>
          )}
        </div>
      </div>

      {/* Cover Image Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Cover Image</label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
        <div
          onClick={() => coverInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-violet-500 transition-colors"
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Cover preview" className="w-32 h-32 mx-auto rounded-lg object-cover" />
          ) : coverPath ? (
            <div className="text-sm text-green-400">✓ Cover image uploaded</div>
          ) : (
            <>
              <div className="text-3xl mb-2">🖼️</div>
              <div className="text-sm text-neutral-400">Click to upload cover image</div>
              <div className="text-xs text-neutral-600 mt-1">JPEG, PNG, WebP (max 10MB)</div>
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
          disabled={saving || uploading}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? (uploadProgress || 'Saving...') : isEdit ? 'Update Song' : 'Create Song'}
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
