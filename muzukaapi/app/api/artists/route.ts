import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

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
