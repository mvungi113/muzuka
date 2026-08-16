export const metadata = {
  title: "Muzuka API",
  description: "Public REST API for the Muzuka music streaming platform. Integrate songs, artists, albums, search and more.",
};

const BASE_URL = "https://muzuka-lac.vercel.app";

const endpointGroups = [
  {
    title: "Songs",
    items: [
      ["GET", "/api/songs", "List published songs (paginated)"],
      ["GET", "/api/songs/top?period=week", "Top songs by plays"],
      ["GET", "/api/songs/:id", "Single song with artist, album, moods"],
      ["GET", "/api/songs/:id/stream", "Get a signed streaming URL"],
    ],
  },
  {
    title: "Artists & Albums",
    items: [
      ["GET", "/api/artists", "List artists"],
      ["GET", "/api/artists/:id", "Artist with songs & albums"],
      ["GET", "/api/albums", "List published albums"],
      ["GET", "/api/albums/:id", "Album with its songs"],
    ],
  },
  {
    title: "Genres & Moods",
    items: [
      ["GET", "/api/genres", "List genres"],
      ["GET", "/api/genres/:id/songs", "Songs in a genre"],
      ["GET", "/api/moods", "List moods"],
      ["GET", "/api/moods/:id/songs", "Songs for a mood"],
    ],
  },
  {
    title: "Discovery & Library",
    items: [
      ["GET", "/api/search?q=love", "Search songs, artists, albums"],
      ["GET", "/api/recommendations", "Personalized picks (auth)"],
      ["GET", "/api/playlists", "User / public playlists"],
      ["GET", "/api/user/liked-songs", "Current user's library (auth)"],
    ],
  },
  {
    title: "Media",
    items: [
      ["GET", "/api/files/:bucket/:path", "Resolve a cover / image / audio file"],
      ["GET", "/api/health", "Service health check"],
    ],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <header className="mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> REST API · v1
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Muzuka API</h1>
          <p className="mt-3 max-w-2xl text-lg text-neutral-400">
            The public backend for the Muzuka music streaming platform. Browse songs,
            artists, albums, genres and moods, search the catalogue, and stream audio —
            all over a simple, predictable JSON API.
          </p>
        </header>

        {/* Base URL */}
        <section className="mb-12 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Base URL</h2>
          <code className="mt-2 block rounded-lg bg-black px-4 py-3 text-sm text-violet-300">{BASE_URL}</code>
          <p className="mt-3 text-sm text-neutral-500">
            All endpoints are relative to this base. Responses are JSON with a consistent envelope (see below).
          </p>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold">Authentication</h2>
          <p className="text-neutral-400">
            Endpoints that return personal data expect a JSON Web Token issued when a user
            signs in. Send it on every request in the <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm text-violet-300">Authorization</code> header:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl bg-black p-4 text-sm"><code>{`Authorization: Bearer <YOUR_JWT>`}</code></pre>
          <p className="mt-3 text-sm text-neutral-500">
            Public browsing (songs, artists, search, discovery) works without a token.
          </p>
        </section>

        {/* Quick start examples */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Quick start</h2>

          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">cURL</h3>
          <pre className="overflow-x-auto rounded-xl bg-black p-4 text-sm"><code>{`curl ${BASE_URL}/api/songs?limit=10`}</code></pre>

          <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">JavaScript / TypeScript</h3>
          <pre className="overflow-x-auto rounded-xl bg-black p-4 text-sm"><code>{`const res = await fetch("${BASE_URL}/api/songs?limit=10");
const { data, pagination } = await res.json();
console.log(data); // Song[]`}</code></pre>

          <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">Flutter / Dart</h3>
          <pre className="overflow-x-auto rounded-xl bg-black p-4 text-sm"><code>{`import 'dart:convert';
import 'package:http/http.dart' as http;

final res = await http.get(
  Uri.parse("${BASE_URL}/api/songs?limit=10"),
);
final body = jsonDecode(res.body);
final songs = body['data'] as List; // Song[]`}</code></pre>
        </section>

        {/* Response envelope */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold">Response format</h2>
          <p className="mb-3 text-neutral-400">
            Every response uses the same envelope. Lists are paginated.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-black p-4 text-sm"><code>{`{
  "success": true,
  "data": [ /* ...items... */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 134,
    "totalPages": 7
  }
}`}</code></pre>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Endpoints</h2>
          <div className="space-y-8">
            {endpointGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-lg font-semibold text-violet-300">{group.title}</h3>
                <div className="overflow-hidden rounded-xl border border-neutral-800">
                  {group.items.map(([method, path, desc], i) => (
                    <div
                      key={path}
                      className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${
                        i % 2 === 0 ? "bg-neutral-900/40" : "bg-neutral-900/70"
                      }`}
                    >
                      <span
                        className={`w-14 shrink-0 rounded px-2 py-0.5 text-center text-xs font-bold ${
                          method === "GET"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {method}
                      </span>
                      <code className="shrink-0 text-sm text-neutral-100">{path}</code>
                      <span className="text-sm text-neutral-500 sm:ml-auto">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Files note */}
        <section className="mb-12 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="mb-2 text-lg font-semibold">Media &amp; files</h2>
          <p className="text-neutral-400">
            Cover art, artist images and audio are served from object storage. Resolve a
            file path returned by the API through the media endpoint:
          </p>
          <code className="mt-3 block rounded-lg bg-black px-4 py-3 text-sm text-violet-300">
            {`${BASE_URL}/api/files/covers/<path>`}
          </code>
          <p className="mt-3 text-sm text-neutral-500">
            Buckets: <code className="text-neutral-300">covers</code>,{" "}
            <code className="text-neutral-300">artist-images</code>,{" "}
            <code className="text-neutral-300">album-images</code>,{" "}
            <code className="text-neutral-300">avatars</code>,{" "}
            <code className="text-neutral-300">songs</code>.
          </p>
        </section>

        <footer className="border-t border-neutral-800 pt-8 text-center text-sm text-neutral-600">
          Muzuka API · Built with Next.js, Prisma &amp; Supabase
        </footer>
      </div>
    </main>
  );
}
