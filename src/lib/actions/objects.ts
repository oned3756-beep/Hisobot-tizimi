"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { objectSchema } from "@/lib/validation";

export type ObjectFormState = {
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

export async function createObjectAction(
  _prevState: ObjectFormState,
  formData: FormData,
): Promise<ObjectFormState> {
  await requireAdmin();

  const parsed = objectSchema.safeParse({
    nameUz: formData.get("nameUz"),
    nameRu: formData.get("nameRu"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.businessObject.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return {
      success: false,
      error: "Bu slug allaqachon band",
      fieldErrors: { slug: ["Bu slug allaqachon band"] },
    };
  }

  await prisma.businessObject.create({ data: parsed.data });
  revalidatePath("/admin/objects");
  return { success: true };
}

export async function updateObjectAction(
  _prevState: ObjectFormState,
  formData: FormData,
): Promise<ObjectFormState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = objectSchema.safeParse({
    nameUz: formData.get("nameUz"),
    nameRu: formData.get("nameRu"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.businessObject.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing && existing.id !== id) {
    return {
      success: false,
      error: "Bu slug allaqachon band",
      fieldErrors: { slug: ["Bu slug allaqachon band"] },
    };
  }

  await prisma.businessObject.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/objects");
  return { success: true };
}

export async function toggleObjectActiveAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const object = await prisma.businessObject.findUnique({ where: { id } });
  if (!object) return;
  await prisma.businessObject.update({
    where: { id },
    data: { isActive: !object.isActive },
  });
  revalidatePath("/admin/objects");
}

export async function deleteObjectAction(
  _prevState: ObjectFormState,
  formData: FormData,
): Promise<ObjectFormState> {
  await requireAdmin();
  const id = formData.get("id") as string;

  const [reportCount, voucherCount, userCount] = await Promise.all([
    prisma.dailyReport.count({ where: { objectId: id } }),
    prisma.voucher.count({ where: { objectId: id } }),
    prisma.user.count({ where: { objectId: id } }),
  ]);

  if (reportCount > 0 || voucherCount > 0 || userCount > 0) {
    return {
      success: false,
      error: `Bu obyektni o'chirib bo'lmaydi: unga bog'liq ${reportCount} ta hisobot, ${voucherCount} ta vaucher, ${userCount} ta foydalanuvchi bor. Avval ularni ko'chiring yoki obyektni faolsizlantiring.`,
    };
  }

  await prisma.businessObject.delete({ where: { id } });
  revalidatePath("/admin/objects");
  return { success: true };
}
