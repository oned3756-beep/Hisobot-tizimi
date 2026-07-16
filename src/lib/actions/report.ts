"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reportSchema } from "@/lib/validation";
import { notifyReportSaved } from "@/lib/telegram";

export type SaveReportState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function parseOrgCount(value: FormDataEntryValue | null): number {
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function saveReportAction(
  _prevState: SaveReportState,
  formData: FormData,
): Promise<SaveReportState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF" || !session.user.objectId) {
    return { success: false, error: "Ruxsat yo'q" };
  }

  const parsed = reportSchema.safeParse({
    date: formData.get("date"),
    cashAmount: formData.get("cashAmount"),
    cardAmount: formData.get("cardAmount"),
    transferAmount: formData.get("transferAmount"),
    qrAmount: formData.get("qrAmount"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { date, cashAmount, cardAmount, transferAmount, qrAmount, comment } =
    parsed.data;
  const totalAmount = cashAmount + cardAmount + transferAmount + qrAmount;
  const objectId = session.user.objectId;
  const parsedDate = new Date(`${date}T00:00:00.000Z`);

  const organizations = await prisma.organization.findMany({
    where: { isActive: true, objectLinks: { some: { objectId } } },
  });

  let visitorCount: number;
  const orgCounts: { organizationId: string; visitorCount: number }[] = [];

  if (organizations.length === 0) {
    visitorCount = parseOrgCount(formData.get("visitorCount"));
  } else {
    for (const org of organizations) {
      const count = parseOrgCount(formData.get(`org_${org.id}`));
      if (count > 0) {
        orgCounts.push({ organizationId: org.id, visitorCount: count });
      }
    }
    visitorCount = orgCounts.reduce((sum, o) => sum + o.visitorCount, 0);
  }

  const report = await prisma.$transaction(async (tx) => {
    const existing = await tx.dailyReport.findUnique({
      where: { objectId_date: { objectId, date: parsedDate } },
      include: { organizationEntries: { include: { organization: true } } },
    });

    if (existing) {
      await tx.reportRevision.create({
        data: {
          reportId: existing.id,
          editedById: session.user.id,
          snapshot: {
            visitorCount: existing.visitorCount,
            cashAmount: Number(existing.cashAmount),
            cardAmount: Number(existing.cardAmount),
            transferAmount: Number(existing.transferAmount),
            qrAmount: Number(existing.qrAmount),
            totalAmount: Number(existing.totalAmount),
            comment: existing.comment,
            organizationEntries: existing.organizationEntries.map((e) => ({
              organizationName: e.organization.nameUz,
              visitorCount: e.visitorCount,
            })),
          },
        },
      });
    }

    const saved = await tx.dailyReport.upsert({
      where: { objectId_date: { objectId, date: parsedDate } },
      update: {
        visitorCount,
        cashAmount,
        cardAmount,
        transferAmount,
        qrAmount,
        totalAmount,
        comment: comment || null,
        createdById: session.user.id,
      },
      create: {
        objectId,
        date: parsedDate,
        visitorCount,
        cashAmount,
        cardAmount,
        transferAmount,
        qrAmount,
        totalAmount,
        comment: comment || null,
        createdById: session.user.id,
      },
    });

    await tx.reportOrganizationEntry.deleteMany({
      where: { reportId: saved.id },
    });
    if (orgCounts.length > 0) {
      await tx.reportOrganizationEntry.createMany({
        data: orgCounts.map((o) => ({ ...o, reportId: saved.id })),
      });
    }

    return saved;
  });

  revalidatePath("/report");
  revalidatePath("/report/history");

  const object = await prisma.businessObject.findUnique({
    where: { id: objectId },
  });
  const orgEntries = orgCounts.length
    ? await prisma.organization.findMany({
        where: { id: { in: orgCounts.map((o) => o.organizationId) } },
      })
    : [];
  notifyReportSaved({
    objectNameUz: object?.nameUz ?? "",
    date,
    visitorCount,
    cashAmount,
    cardAmount,
    transferAmount,
    qrAmount,
    totalAmount,
    comment,
    organizations: orgCounts.map((o) => ({
      name: orgEntries.find((e) => e.id === o.organizationId)?.nameUz ?? "",
      visitorCount: o.visitorCount,
    })),
  });

  return { success: true };
}

export async function getReportForDate(objectId: string, date: string) {
  const parsedDate = new Date(`${date}T00:00:00.000Z`);
  return prisma.dailyReport.findUnique({
    where: { objectId_date: { objectId, date: parsedDate } },
    include: { organizationEntries: true },
  });
}

export async function listReportsForObject(objectId: string, limit = 30) {
  return prisma.dailyReport.findMany({
    where: { objectId },
    orderBy: { date: "desc" },
    take: limit,
    include: { organizationEntries: { include: { organization: true } } },
  });
}

export async function getReportWithRevisions(reportId: string) {
  return prisma.dailyReport.findUnique({
    where: { id: reportId },
    include: {
      object: true,
      revisions: {
        orderBy: { editedAt: "desc" },
        include: { editedBy: true },
      },
    },
  });
}
