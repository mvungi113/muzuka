import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, comparePassword, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { name, avatarUrl } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json(successResponse(updated, 'Profile updated'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Update profile error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    await prisma.user.delete({ where: { id: user.id } });

    return Response.json(successResponse(null, 'Account deleted'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Delete account error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
