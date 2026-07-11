import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type AdminReportFilter = {
  from: string;
  to: string;
  objectIds?: string[];
};

export function buildWhere(filter: AdminReportFilter): Prisma.DailyReportWhereInput {
  const where: Prisma.DailyReportWhereInput = {
    date: {
      gte: new Date(`${filter.from}T00:00:00.000Z`),
      lte: new Date(`${filter.to}T00:00:00.000Z`),
    },
  };
  if (filter.objectIds && filter.objectIds.length > 0) {
    where.objectId = { in: filter.objectIds };
  }
  return where;
}

export async function listAdminReports(filter: AdminReportFilter) {
  return prisma.dailyReport.findMany({
    where: buildWhere(filter),
    include: {
      object: true,
      organizationEntries: { include: { organization: true } },
    },
    orderBy: [{ date: "desc" }, { object: { nameUz: "asc" } }],
  });
}

export async function getAdminSummary(filter: AdminReportFilter) {
  const rows = await prisma.dailyReport.findMany({
    where: buildWhere(filter),
    select: {
      visitorCount: true,
      cashAmount: true,
      cardAmount: true,
      transferAmount: true,
      qrAmount: true,
      totalAmount: true,
    },
  });

  return rows.reduce(
    (acc, r) => ({
      visitorCount: acc.visitorCount + r.visitorCount,
      cashAmount: acc.cashAmount + Number(r.cashAmount),
      cardAmount: acc.cardAmount + Number(r.cardAmount),
      transferAmount: acc.transferAmount + Number(r.transferAmount),
      qrAmount: acc.qrAmount + Number(r.qrAmount),
      totalAmount: acc.totalAmount + Number(r.totalAmount),
    }),
    {
      visitorCount: 0,
      cashAmount: 0,
      cardAmount: 0,
      transferAmount: 0,
      qrAmount: 0,
      totalAmount: 0,
    },
  );
}
