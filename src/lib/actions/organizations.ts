"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { organizationSchema } from "@/lib/validation";

export type OrganizationFormState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Ruxsat yo'q");
  }
}

function getObjectIds(formData: FormData): string[] {
  return formData.getAll("objectIds").map(String).filter(Boolean);
}

export async function createOrganizationAction(
  _prevState: OrganizationFormState,
  formData: FormData,
): Promise<OrganizationFormState> {
  await requireAdmin();

  const parsed = organizationSchema.safeParse({
    nameUz: formData.get("nameUz"),
    nameRu: formData.get("nameRu"),
    slug: formData.get("slug"),
    commissionPercent: formData.get("commissionPercent"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.organization.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return {
      success: false,
      error: "Bu slug allaqachon band",
      fieldErrors: { slug: ["Bu slug allaqachon band"] },
    };
  }

  const objectIds = getObjectIds(formData);
  await prisma.organization.create({
    data: {
      ...parsed.data,
      objectLinks: {
        create: objectIds.map((objectId) => ({ objectId })),
      },
    },
  });
  revalidatePath("/admin/organizations");
  revalidatePath("/report");
  return { success: true };
}

export async function updateOrganizationAction(
  _prevState: OrganizationFormState,
  formData: FormData,
): Promise<OrganizationFormState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = organizationSchema.safeParse({
    nameUz: formData.get("nameUz"),
    nameRu: formData.get("nameRu"),
    slug: formData.get("slug"),
    commissionPercent: formData.get("commissionPercent"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.organization.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing && existing.id !== id) {
    return {
      success: false,
      error: "Bu slug allaqachon band",
      fieldErrors: { slug: ["Bu slug allaqachon band"] },
    };
  }

  const objectIds = getObjectIds(formData);
  await prisma.$transaction([
    prisma.organization.update({ where: { id }, data: parsed.data }),
    prisma.organizationObject.deleteMany({ where: { organizationId: id } }),
    prisma.organizationObject.createMany({
      data: objectIds.map((objectId) => ({ organizationId: id, objectId })),
    }),
  ]);
  revalidatePath("/admin/organizations");
  revalidatePath("/report");
  return { success: true };
}

export async function toggleOrganizationActiveAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const organization = await prisma.organization.findUnique({ where: { id } });
  if (!organization) return;
  await prisma.organization.update({
    where: { id },
    data: { isActive: !organization.isActive },
  });
  revalidatePath("/admin/organizations");
  revalidatePath("/report");
}

export async function deleteOrganizationAction(
  _prevState: OrganizationFormState,
  formData: FormData,
): Promise<OrganizationFormState> {
  await requireAdmin();
  const id = formData.get("id") as string;

  const [entryCount, voucherCount, userCount] = await Promise.all([
    prisma.reportOrganizationEntry.count({ where: { organizationId: id } }),
    prisma.voucher.count({ where: { organizationId: id } }),
    prisma.user.count({ where: { organizationId: id } }),
  ]);

  if (entryCount > 0 || voucherCount > 0 || userCount > 0) {
    return {
      success: false,
      error: `Bu tashkilotni o'chirib bo'lmaydi: unga bog'liq ${entryCount} ta hisobot yozuvi, ${voucherCount} ta vaucher, ${userCount} ta foydalanuvchi bor. Avval ularni ko'chiring yoki tashkilotni faolsizlantiring.`,
    };
  }

  await prisma.organization.delete({ where: { id } });
  revalidatePath("/admin/organizations");
  revalidatePath("/report");
  return { success: true };
}
