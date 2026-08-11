import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { moodSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = moodSchema.partial().safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const existing = await prisma.mood.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Mood not found', 'MOOD_NOT_FOUND'), { status: 404 });
    }

    const mood = await prisma.mood.update({ where: { id }, data: parsed.data });
    return Response.json(successResponse(mood));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Update mood error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.mood.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(errorResponse('Mood not found', 'MOOD_NOT_FOUND'), { status: 404 });
    }

    await prisma.mood.delete({ where: { id } });
    return Response.json(successResponse(null, 'Mood deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    if (message === 'FORBIDDEN') {
      return Response.json(errorResponse('Admin access required', 'FORBIDDEN'), { status: 403 });
    }
    console.error('Delete mood error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
