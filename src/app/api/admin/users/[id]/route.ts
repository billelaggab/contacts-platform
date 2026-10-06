import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH /api/admin/users/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const actor = await prisma.user.findUnique({
    where: { id: session.user.id as string },
  });
  if (!actor || actor.role !== "SUPER_ADMIN")
    return new NextResponse("Forbidden", { status: 403 });

  const { id } = await params;
  const { status } = await req.json();
  if (!["APPROVED", "REJECTED", "SUSPENDED"].includes(status))
    return new NextResponse("Bad Request", { status: 400 });

  const updated = await prisma.user.update({
    where: { id },
    data: { status: status as any },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "APPROVE_USER",
      targetId: id,
    },
  });

  return NextResponse.json(updated);
}
