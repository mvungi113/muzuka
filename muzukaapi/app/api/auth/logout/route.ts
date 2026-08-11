import { removeAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/api-response';

export async function POST() {
  try {
    await removeAuthCookie();
    return Response.json(successResponse(null, 'Logged out successfully'));
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
