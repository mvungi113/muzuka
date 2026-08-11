import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);

    const [moods, total] = await Promise.all([
      prisma.mood.findMany({
        include: { _count: { select: { songMoods: true } } },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.mood.count(),
    ]);

    return Response.json(paginatedResponse(moods, page, limit, total));
  } catch (error) {
    console.error('Get moods error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
