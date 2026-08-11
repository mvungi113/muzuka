import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { albumSchema } from '@/lib/validations';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';
import { uniqueSlug } from '@/lib/slug';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const status = searchParams.get('status');
    const artistId = searchParams.get('artistId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (artistId) where.artistId = artistId;

    const [albums, total] = await Promise.all([
      prisma.album.findMany({
        where,
        include: {
          artist: { select: { id: true, name: true, slug: true } },
          _count: { select: { songs: true, albumLikes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.album.count({ where }),
    ]);

    return Response.json(paginatedResponse(albums, page, limit, total));
  } catch (error) {
    console.error('Get albums error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = albumSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const slug = await uniqueSlug(parsed.data.title, async (s) => {
      const existing = await prisma.album.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const album = await prisma.album.create({
      data: { ...parsed.data, slug },
      include: {
        artist: { select: { id: true, name: true, slug: true } },
      },
    });

    return Response.json(successResponse(album), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Create album error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
