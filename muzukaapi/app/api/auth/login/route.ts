import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return Response.json(
        errorResponse('Invalid email or password', 'INVALID_CREDENTIALS'),
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return Response.json(
        errorResponse('Invalid email or password', 'INVALID_CREDENTIALS'),
        { status: 401 }
      );
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
        },
        token,
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
