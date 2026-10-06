import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const contactQuerySchema = z.object({
  q: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  specialization: z.string().optional(),
  contactType: z.enum(["PUBLIC_PR", "VIP", "PRIVATE"]).optional(),
});

// ─── GET /api/v1/contacts ────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
  });
  if (!user || user.status !== "APPROVED")
    return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const parsed = contactQuerySchema.parse(Object.fromEntries(searchParams));

  const where: any = { deletedAt: null };
  if (parsed.q) {
    where.OR = [
      { fullName: { contains: parsed.q, mode: "insensitive" as const } },
      { organization: { contains: parsed.q, mode: "insensitive" as const } },
    ];
  }
  if (parsed.country) where.country = parsed.country;
  if (parsed.city) where.city = parsed.city;
  if (parsed.specialization) where.specialization = parsed.specialization;
  if (parsed.contactType) where.contactType = parsed.contactType;

  // Super admin sees everything; others see PUBLIC_PR + VIP + their own PRIVATE
  if (user.role !== "SUPER_ADMIN") {
    where.OR = [
      { contactType: "PUBLIC_PR" },
      { contactType: "VIP" },
      { createdById: user.id },
    ];
  }

  const contacts = await prisma.contact.findMany({
    where,
    include: {
      phoneNumbers: true,
      _count: { select: { accessRequests: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // ─── Apply VIP masking ────────────────────────────────────
  const masked = contacts.map((c) => {
    if (c.contactType === "PUBLIC_PR") return c;

    if (c.contactType === "VIP") {
      const approved = c.accessRequests.some(
        (r: any) => r.journalistId === user.id && r.status === "APPROVED"
      );
      if (!approved) {
        return {
          ...c,
          email: undefined,
          phoneNumbers: [],
          _canRequest: true,
        };
      }
    }

    // PRIVATE — only creator (guard double-check)
    if (c.contactType === "PRIVATE" && c.createdById !== user.id) {
      return { ...c, email: undefined, phoneNumbers: [] };
    }
    return c;
  });

  return NextResponse.json(masked);
}

// ─── POST /api/v1/contacts ───────────────────────────────────
const createSchema = z.object({
  fullName: z.string().min(1),
  currentJobTitle: z.string().optional(),
  organization: z.string().optional(),
  email: z.string().email().nullable().optional(),
  contactType: z.enum(["PUBLIC_PR", "VIP", "PRIVATE"]).optional(),
  specialization: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  phoneNumbers: z.array(z.object({ phoneNumber: z.string(), label: z.string().optional(), isPrimary: z.boolean().optional() })).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id as string } });
  if (!user || user.status !== "APPROVED")
    return new NextResponse("Forbidden", { status: 403 });

  const body = createSchema.parse(await req.json());

  const contact = await prisma.contact.create({
    data: {
      ...body,
      createdById: user.id,
      phoneNumbers: {
        create: (body.phoneNumbers ?? []).map((p: any) => ({
          phoneNumber: p.phoneNumber,
          label: p.label ?? "MOBILE",
          isPrimary: p.isPrimary ?? false,
        })),
      },
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
