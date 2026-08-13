import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const role = searchParams.get('role');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          _count: {
            select: {
              songLikes: true,
              albumLikes: true,
              artistFollowers: true,
              playlists: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return Response.json(paginatedResponse(users, page, limit, total));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Admin get users error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
