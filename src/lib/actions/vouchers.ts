"use server";

import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { voucherSchema, redeemVoucherSchema } from "@/lib/validation";
import { todayInTashkent } from "@/lib/date";

export type VoucherFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateVoucherCode(): string {
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) part1 += CODE_CHARS[randomInt(CODE_CHARS.length)];
  for (let i = 0; i < 4; i++) part2 += CODE_CHARS[randomInt(CODE_CHARS.length)];
  return `${part1}-${part2}`;
}

export async function createVoucherAction(
  _prevState: VoucherFormState,
  formData: FormData,
): Promise<VoucherFormState> {
  const session = await auth();
  if (
    !session?.user ||
    session.user.role !== "CASHIER" ||
    !session.user.organizationId
  ) {
    return { success: false, error: "Ruxsat yo'q" };
  }

  const parsed = voucherSchema.safeParse({
    objectId: formData.get("objectId"),
    guestCount: formData.get("guestCount"),
    cashAmount: formData.get("cashAmount"),
    cardAmount: formData.get("cardAmount"),
    transferAmount: formData.get("transferAmount"),
    qrAmount: formData.get("qrAmount"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { objectId, guestCount, cashAmount, cardAmount, transferAmount, qrAmount } =
    parsed.data;
  const totalAmount = cashAmount + cardAmount + transferAmount + qrAmount;

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });
  if (!organization || !organization.isActive) {
    return { success: false, error: "Tashkilot topilmadi yoki faol emas" };
  }
  const commissionPercent = organization.commissionPercent;
  const commissionAmount = (totalAmount * Number(commissionPercent)) / 100;

  let code = generateVoucherCode();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (!existing) break;
    code = generateVoucherCode();
  }

  const voucher = await prisma.voucher.create({
    data: {
      code,
      objectId,
      guestCount,
      cashAmount,
      cardAmount,
      transferAmount,
      qrAmount,
      totalAmount,
      organizationId: organization.id,
      commissionPercent,
      commissionAmount,
      soldById: session.user.id,
    },
  });

  revalidatePath("/cashier/history");
  redirect(`/cashier/vouchers/${voucher.id}/print`);
}

export type RedeemState = {
  success: boolean;
  error?: string;
  guestCount?: number;
};

export async function redeemVoucherAction(
  _prevState: RedeemState,
  formData: FormData,
): Promise<RedeemState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF" || !session.user.objectId) {
    return { success: false, error: "Ruxsat yo'q" };
  }

  const parsed = redeemVoucherSchema.safeParse({
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { success: false, error: "Kod kiritilishi shart" };
  }

  const code = parsed.data.code.trim().toUpperCase();
  const voucher = await prisma.voucher.findUnique({ where: { code } });

  if (!voucher) {
    return { success: false, error: "Vaucher topilmadi" };
  }
  if (voucher.objectId !== session.user.objectId) {
    return { success: false, error: "Bu vaucher boshqa xizmat uchun mo'ljallangan" };
  }
  if (voucher.status === "USED") {
    return { success: false, error: "Bu vaucher allaqachon ishlatilgan" };
  }

  await prisma.voucher.update({
    where: { id: voucher.id },
    data: {
      status: "USED",
      usedAt: new Date(),
      usedById: session.user.id,
    },
  });

  revalidatePath("/report");
  revalidatePath("/admin/vouchers");
  return { success: true, guestCount: voucher.guestCount };
}

export async function getVoucherById(id: string) {
  return prisma.voucher.findUnique({
    where: { id },
    include: { object: true, organization: true },
  });
}

export async function listVouchersForCashier(cashierId: string, limit = 50) {
  return prisma.voucher.findMany({
    where: { soldById: cashierId },
    orderBy: { soldAt: "desc" },
    take: limit,
    include: { object: true, organization: true },
  });
}

export async function getTodayRedeemedForObject(objectId: string) {
  const today = todayInTashkent();
  const start = new Date(`${today}T00:00:00.000Z`);
  const end = new Date(`${today}T23:59:59.999Z`);

  const vouchers = await prisma.voucher.findMany({
    where: {
      objectId,
      status: "USED",
      usedAt: { gte: start, lte: end },
    },
  });

  return vouchers.reduce(
    (acc, v) => ({
      guestCount: acc.guestCount + v.guestCount,
      totalAmount: acc.totalAmount + Number(v.totalAmount),
    }),
    { guestCount: 0, totalAmount: 0 },
  );
}
