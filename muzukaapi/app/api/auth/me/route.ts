import { getCurrentUser } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json(errorResponse('Not authenticated', 'UNAUTHORIZED'), { status: 401 });
    }
    return Response.json(successResponse(user));
  } catch (error) {
    console.error('Get me error:', error);
    return Response.json(errorResponse('Internal server error'), { status: 500 });
  }
}
