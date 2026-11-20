import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/token";

const PROTECTED_ROUTES = ["/sell", "/profile", "/my-listings"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = token ? Boolean(await verifyToken(token)) : false;

  // 1. If accessing protected route while unauthenticated, redirect to login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated user visits login or signup, redirect to home
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sell/:path*",
    "/profile/:path*",
    "/my-listings/:path*",
    "/login",
    "/signup",
  ],
};
