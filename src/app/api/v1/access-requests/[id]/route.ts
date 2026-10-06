import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const reviewSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

// PATCH /api/v1/access-requests/[id] — Admin approves/rejects VIP access
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const actor = await prisma.user.findUnique({ where: { id: session.user.id as string } });
  if (!actor || actor.role !== "SUPER_ADMIN")
    return new NextResponse("Forbidden", { status: 403 });

  const { status } = reviewSchema.parse(await req.json());

  const updated = await prisma.contactAccessRequest.update({
    where: { id: params.id },
    data: {
      status,
      reviewedBy: actor.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "REVEAL_VIP",
      targetId: updated.contactId,
    },
  });

  return NextResponse.json(updated);
}
