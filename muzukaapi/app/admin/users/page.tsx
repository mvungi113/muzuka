import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { playlists: true, songLikes: true, listeningHistory: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return users;
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-neutral-500 text-sm mt-1">{users.length} registered users</p>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">User</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Role</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Joined</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Likes</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-neutral-500 uppercase">Plays</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-neutral-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.role === 'ADMIN' ? 'bg-red-900 text-red-300' :
                    user.role === 'SUPER_ADMIN' ? 'bg-orange-900 text-orange-300' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-neutral-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-sm text-neutral-400 text-right">{user._count.songLikes}</td>
                <td className="px-5 py-4 text-sm text-neutral-400 text-right">{user._count.listeningHistory}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            <p className="text-lg">No users yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
