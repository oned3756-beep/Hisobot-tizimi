"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { objectSchema } from "@/lib/validation";

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

export async function createOrganizationAction(
  _prevState: OrganizationFormState,
  formData: FormData,
): Promise<OrganizationFormState> {
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

  await prisma.organization.create({ data: parsed.data });
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

  await prisma.organization.update({ where: { id }, data: parsed.data });
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
