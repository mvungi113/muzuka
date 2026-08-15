import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin-login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('muzuka_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin-login', request.url));
  }

  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    );

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    if (payload.role !== 'ADMIN' && payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/admin-login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login'],
};
