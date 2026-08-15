import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId || typeof deviceId !== 'string') {
      return Response.json(
        errorResponse('Device ID is required', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({ where: { deviceId } });

    if (!user) {
      const deviceName = `Device ${deviceId.slice(0, 8)}`;
      user = await prisma.user.create({
        data: {
          name: deviceName,
          email: `device-${deviceId}@muzuka.local`,
          deviceId,
          isAnonymous: true,
        },
      });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return Response.json(
      successResponse({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          isAnonymous: user.isAnonymous,
        },
        token,
      })
    );
  } catch (error) {
    console.error('Device auth error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
