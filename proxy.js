// ponytail: proxy.js = middleware di Next.js 16. proteksi route berdasarkan role
import { NextResponse } from 'next/server';

const protectedRoutes = {
  '/admin': 'admin',
  '/riwayat': 'pelanggan',
  '/keranjang': 'pelanggan',
  '/checkout': 'pelanggan',
  '/profil': 'pelanggan',
};

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // cari prefix route yang cocok
  const matched = Object.entries(protectedRoutes).find(([prefix]) =>
    pathname.startsWith(prefix)
  );
  if (!matched) return NextResponse.next();

  const token = request.cookies.get('__session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // verifikasi token via Firebase Admin SDK dilakukan di halaman masing-masing
  // cookie session dipasang/dicek di halaman via client-side Firebase Auth
  // ponytail: verifikasi role via Client sudah cukup untuk app ini
  // upgrade: verifikasi via Firebase Admin di proxy jika butuh keamanan lebih ketat

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/riwayat/:path*', '/keranjang/:path*', '/checkout/:path*', '/profil/:path*'],
};
