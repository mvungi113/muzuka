import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        errorResponse('Email already in use', 'EMAIL_EXISTS'),
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await setAuthCookie(token);

    return Response.json(successResponse({ user, token }), { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
