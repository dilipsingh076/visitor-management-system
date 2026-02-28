import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected paths require auth. Redirect to /login if no auth cookie.
 * For middleware to work, the login flow must set a cookie when the user logs in
 * (e.g. same name as below). Currently the app uses localStorage; consider
 * setting a cookie on login so this middleware can enforce protection.
 */
const AUTH_COOKIE_NAME = "vms_access";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/guard",
  "/visitors",
  "/checkin",
  "/blacklist",
  "/admin",
  "/platform",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/guard/:path*",
    "/visitors/:path*",
    "/checkin/:path*",
    "/blacklist/:path*",
    "/admin/:path*",
    "/platform/:path*",
  ],
};
