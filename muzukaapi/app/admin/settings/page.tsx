export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-neutral-500 text-sm mt-1">Platform configuration</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h3 className="font-semibold mb-4">Storage</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Provider</span>
              <span>Supabase Storage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Buckets</span>
              <span className="text-neutral-400">songs, covers, artist-images, album-images, avatars</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h3 className="font-semibold mb-4">Database</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Provider</span>
              <span>Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">ORM</span>
              <span>Prisma</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h3 className="font-semibold mb-4">API</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Base URL</span>
              <span className="font-mono text-xs">http://localhost:3000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Auth</span>
              <span>JWT + httpOnly cookies</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h3 className="font-semibold mb-4">Audio Formats</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Supported</span>
              <span>MP3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Future</span>
              <span className="text-neutral-400">AAC, M4A, FLAC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
