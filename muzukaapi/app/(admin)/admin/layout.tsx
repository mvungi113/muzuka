'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/songs', label: 'Songs', icon: '🎵' },
  { href: '/admin/artists', label: 'Artists', icon: '🎤' },
  { href: '/admin/albums', label: 'Albums', icon: '💿' },
  { href: '/admin/genres', label: 'Genres', icon: '🎶' },
  { href: '/admin/moods', label: 'Moods', icon: '😊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin-login');
    router.refresh();
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-xl font-bold tracking-tight">Muzuka Admin</h1>
          <p className="text-xs text-neutral-500 mt-1">Music management</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <span className="text-base">🏠</span>
            Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-neutral-800 transition-colors w-full"
          >
            <span className="text-base">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-800 px-8 py-4">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Logout
              </button>
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
                A
              </div>
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
