import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type VoucherFilter = {
  from: string;
  to: string;
  objectIds?: string[];
  status?: "UNUSED" | "USED";
};

export function buildVoucherWhere(
  filter: VoucherFilter,
): Prisma.VoucherWhereInput {
  const where: Prisma.VoucherWhereInput = {
    soldAt: {
      gte: new Date(`${filter.from}T00:00:00.000Z`),
      lte: new Date(`${filter.to}T23:59:59.999Z`),
    },
  };
  if (filter.objectIds && filter.objectIds.length > 0) {
    where.objectId = { in: filter.objectIds };
  }
  if (filter.status) {
    where.status = filter.status;
  }
  return where;
}

export async function listAllVouchers(filter: VoucherFilter) {
  return prisma.voucher.findMany({
    where: buildVoucherWhere(filter),
    include: { object: true, organization: true, soldBy: true, usedBy: true },
    orderBy: { soldAt: "desc" },
  });
}

export async function getOrganizationVoucherStats(): Promise<
  Record<string, { soldCount: number; totalCommission: number }>
> {
  const vouchers = await prisma.voucher.findMany({
    select: { organizationId: true, status: true, commissionAmount: true },
  });

  const stats: Record<string, { soldCount: number; totalCommission: number }> =
    {};
  for (const v of vouchers) {
    const entry = stats[v.organizationId] ?? {
      soldCount: 0,
      totalCommission: 0,
    };
    entry.soldCount += 1;
    if (v.status === "USED") {
      entry.totalCommission += Number(v.commissionAmount);
    }
    stats[v.organizationId] = entry;
  }
  return stats;
}

export async function getVoucherSummary(filter: VoucherFilter) {
  const [sold, used] = await Promise.all([
    prisma.voucher.count({ where: buildVoucherWhere(filter) }),
    prisma.voucher.findMany({
      where: { ...buildVoucherWhere(filter), status: "USED" },
      select: { guestCount: true, totalAmount: true, commissionAmount: true },
    }),
  ]);

  const usedSummary = used.reduce(
    (acc, v) => ({
      count: acc.count + 1,
      guestCount: acc.guestCount + v.guestCount,
      totalAmount: acc.totalAmount + Number(v.totalAmount),
      totalCommission: acc.totalCommission + Number(v.commissionAmount),
    }),
    { count: 0, guestCount: 0, totalAmount: 0, totalCommission: 0 },
  );

  return { soldCount: sold, ...usedSummary };
}
