"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serviceSchema } from "@/lib/validation";

export type ServiceFormState = {
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

export async function createServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    objectId: formData.get("objectId"),
    name: formData.get("name"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.service.create({ data: parsed.data });
  revalidatePath("/admin/services");
  revalidatePath("/cashier");
  return { success: true };
}

export async function updateServiceAction(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  await requireAdmin();

  const id = formData.get("id") as string;
  const parsed = serviceSchema.safeParse({
    objectId: formData.get("objectId"),
    name: formData.get("name"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.service.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/services");
  revalidatePath("/cashier");
  return { success: true };
}

export async function toggleServiceActiveAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return;
  await prisma.service.update({
    where: { id },
    data: { isActive: !service.isActive },
  });
  revalidatePath("/admin/services");
  revalidatePath("/cashier");
}

export async function deleteServiceAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  // Vaucherda ishlatilgan bo'lsa, bog'lanish SET NULL bo'ladi (serviceName saqlanadi),
  // shuning uchun xavfsiz o'chirish mumkin.
  await prisma.service.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/services");
  revalidatePath("/cashier");
}

export async function listServicesForObject(objectId: string) {
  return prisma.service.findMany({
    where: { objectId, isActive: true },
    orderBy: { name: "asc" },
  });
}
