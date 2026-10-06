import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/register", "/pending-approval", "/api/auth"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const userStatus = (req.auth?.user as any)?.status;

  // Only allow APPROVED users to access the app
  if (userStatus !== "APPROVED") {
    return NextResponse.redirect(new URL("/pending-approval", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
