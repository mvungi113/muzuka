'use client';

import { useState, useRef } from 'react';
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

interface ArtistFormProps {
  artist?: {
    id: string;
    name: string;
    biography?: string;
    imagePath?: string;
    coverPath?: string;
  };
}

export default function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const isEdit = !!artist;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(artist?.name || '');
  const [biography, setBiography] = useState(artist?.biography || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState(artist?.imagePath || '');
  const [coverPath, setCoverPath] = useState(artist?.coverPath || '');
  const [imagePreview, setImagePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

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
      let finalImagePath = imagePath;
      let finalCoverPath = coverPath;

      if (imageFile) {
        const result = await uploadFile(imageFile, 'artist-image');
        finalImagePath = result.path;
      }
      if (coverFile) {
        const result = await uploadFile(coverFile, 'artist-image');
        finalCoverPath = result.path;
      }

      const url = isEdit ? `/api/admin/artists/${artist!.id}` : '/api/admin/artists';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          biography: biography || undefined,
          imagePath: finalImagePath || undefined,
          coverPath: finalCoverPath || undefined,
        }),
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
        <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="Artist name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">Biography</label>
        <textarea
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          rows={4}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="Artist biography"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Profile Image</label>
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          <div
            onClick={() => imageInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-700 rounded-lg p-4 text-center cursor-pointer hover:border-violet-500 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="" className="w-20 h-20 mx-auto rounded-full object-cover" />
            ) : imagePath ? (
              <div className="text-sm text-green-400">✓ Image uploaded</div>
            ) : (
              <div className="text-sm text-neutral-400">Profile image</div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1.5">Cover Image</label>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
          <div
            onClick={() => coverInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-700 rounded-lg p-4 text-center cursor-pointer hover:border-violet-500 transition-colors"
          >
            {coverPreview ? (
              <img src={coverPreview} alt="" className="w-full h-20 mx-auto rounded-lg object-cover" />
            ) : coverPath ? (
              <div className="text-sm text-green-400">✓ Cover uploaded</div>
            ) : (
              <div className="text-sm text-neutral-400">Cover image</div>
            )}
          </div>
        </div>
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
