import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/pending-approval", "/api/auth"];

export default auth(async function middleware(req) {
  const { nextUrl } = req;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
  });

  if (!user || user.status !== "APPROVED") {
    return NextResponse.redirect(new URL("/pending-approval", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
