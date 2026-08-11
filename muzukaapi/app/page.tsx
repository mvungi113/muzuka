export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Muzuka API</h1>
        <p className="text-neutral-400 text-lg">Music streaming platform backend</p>
        <div className="pt-4 text-sm text-neutral-500 space-y-1">
          <p>Health check: <code className="bg-neutral-900 px-2 py-0.5 rounded">GET /api/health</code></p>
          <p>Auth: <code className="bg-neutral-900 px-2 py-0.5 rounded">POST /api/auth/register</code> · <code className="bg-neutral-900 px-2 py-0.5 rounded">POST /api/auth/login</code></p>
          <p>Songs: <code className="bg-neutral-900 px-2 py-0.5 rounded">GET /api/songs</code></p>
          <p>Search: <code className="bg-neutral-900 px-2 py-0.5 rounded">GET /api/search?q=</code></p>
        </div>
      </div>
    </main>
  );
}
