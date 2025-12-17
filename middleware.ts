import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // baca cookie 'token'
  const token = req.cookies.get("token")?.value;

  const protectedPaths = [
    "/", "/absensi", "/pelanggaran", "/lembur", "/profil",
    // tambahkan path lain yang protected
  ];

  // jika path protected dan token tidak ada -> redirect ke /login
  if (protectedPaths.some(p => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p + "/"))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [ "/", "/absensi/:path*", "/pelanggaran/:path*", "/lembur/:path*", "/profil/:path*" ],
};
