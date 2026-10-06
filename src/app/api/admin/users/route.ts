import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/users
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
  });
  if (!user || user.role !== "SUPER_ADMIN")
    return new NextResponse("Forbidden", { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, status: true, pressCardUrl: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}
