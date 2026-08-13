import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, comparePassword, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return Response.json(
        errorResponse('Current password and new password are required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return Response.json(
        errorResponse('New password must be at least 8 characters', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!fullUser) {
      return Response.json(errorResponse('User not found', 'NOT_FOUND'), { status: 404 });
    }

    const valid = await comparePassword(currentPassword, fullUser.passwordHash);
    if (!valid) {
      return Response.json(errorResponse('Current password is incorrect', 'INVALID_PASSWORD'), { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return Response.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'UNAUTHORIZED') {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    console.error('Change password error:', error);
    return Response.json(errorResponse(message), { status: 500 });
  }
}
