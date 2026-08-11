import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { artistSchema } from '@/lib/validations';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';
import { uniqueSlug } from '@/lib/slug';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        include: {
          _count: { select: { songs: true, albums: true, followers: true } },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.artist.count(),
    ]);

    return Response.json(paginatedResponse(artists, page, limit, total));
  } catch (error) {
    console.error('Get artists error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = artistSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const slug = await uniqueSlug(parsed.data.name, async (s) => {
      const existing = await prisma.artist.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const artist = await prisma.artist.create({
      data: { ...parsed.data, slug },
    });

    return Response.json(successResponse(artist), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Create artist error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
