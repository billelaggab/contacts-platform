import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const syncSchema = z.object({
  since: z.string().datetime().optional(),
});

// GET /api/v1/sync/contacts?since=ISO_TIMESTAMP
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
  });
  if (!user || user.status !== "APPROVED")
    return new NextResponse("Forbidden", { status: 403 });

  const { since } = syncSchema.parse(Object.fromEntries(new URL(req.url).searchParams));

  const cursor = since ? new Date(since) : new Date(0);

  const [updated, created, deleted] = await Promise.all([
    // contacts modified since cursor (excluding deleted)
    prisma.contact.findMany({
      where: { updatedAt: { gt: cursor }, deletedAt: null },
      select: { id: true, fullName: true, currentJobTitle: true, organization: true, email: true, avatarUrl: true, contactType: true, specialization: true, country: true, city: true, syncVersion: true, updatedAt: true },
    }),
    // contacts created since cursor
    prisma.contact.findMany({
      where: { createdAt: { gt: cursor }, deletedAt: null },
      select: { id: true, fullName: true, currentJobTitle: true, organization: true, email: true, avatarUrl: true, contactType: true, specialization: true, country: true, city: true, syncVersion: true, updatedAt: true },
    }),
    // soft-deleted contact IDs
    prisma.contact.findMany({
      where: { deletedAt: { not: null }, updatedAt: { gt: cursor } },
      select: { id: true },
    }),
  ]);

  return NextResponse.json({
    updated,
    created,
    deleted: deleted.map((d) => d.id),
    serverTime: new Date().toISOString(),
  });
}
