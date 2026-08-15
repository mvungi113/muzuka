'use client';

import { useState, useEffect } from 'react';

interface Mood { id: string; name: string; slug: string; color?: string; _count: { songMoods: number }; }

export default function MoodsPage() {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6C63FF');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMoods(); }, []);

  async function fetchMoods() {
    const res = await fetch('/api/admin/moods?limit=100');
    const data = await res.json();
    setMoods(data.data || []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await fetch('/api/admin/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), color: newColor }),
    });
    setNewName('');
    fetchMoods();
  }

  async function handleUpdate(id: string) {
    await fetch(`/api/admin/moods/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), color: editColor }),
    });
    setEditingId(null);
    fetchMoods();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this mood?')) return;
    await fetch(`/api/admin/moods/${id}`, { method: 'DELETE' });
    fetchMoods();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Moods</h2>
        <p className="text-neutral-500 text-sm mt-1">{moods.length} moods</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 max-w-md items-end">
        <div className="flex-1">
          <label className="block text-xs text-neutral-500 mb-1">Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New mood name"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Color</label>
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-neutral-700 bg-neutral-800 cursor-pointer"
          />
        </div>
        <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          Add
        </button>
      </form>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800">
        {loading ? (
          <div className="p-8 text-center text-neutral-500">Loading...</div>
        ) : moods.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">No moods yet</div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {moods.map((mood) => (
              <div key={mood.id} className="flex items-center gap-4 px-5 py-3">
                {editingId === mood.id ? (
                  <>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="w-8 h-8 rounded border border-neutral-700 bg-neutral-800 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(mood.id)} className="text-green-400 text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-neutral-500 text-sm">Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: mood.color || '#6C63FF' }} />
                    <span className="flex-1 text-sm">{mood.name}</span>
                    <span className="text-xs text-neutral-500">{mood._count.songMoods} songs</span>
                    <button
                      onClick={() => { setEditingId(mood.id); setEditName(mood.name); setEditColor(mood.color || '#6C63FF'); }}
                      className="text-violet-400 text-sm"
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(mood.id)} className="text-red-400 text-sm">Delete</button>
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
