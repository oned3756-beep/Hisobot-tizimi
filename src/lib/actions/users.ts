"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createUserSchema, resetPasswordSchema } from "@/lib/validation";

export type UserFormState = {
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

export async function createStaffUserAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
    objectId: formData.get("objectId") || undefined,
    organizationId: formData.get("organizationId") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (existing) {
    return {
      success: false,
      error: "Bu login allaqachon band",
      fieldErrors: { username: ["Bu login allaqachon band"] },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role,
      objectId: parsed.data.role === "STAFF" ? parsed.data.objectId : null,
      organizationId:
        parsed.data.role === "CASHIER" ? parsed.data.organizationId : null,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function resetPasswordAction(
  _prevState: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireAdmin();

  const parsed = resetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Ma'lumotlarda xatolik bor",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { passwordHash },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserActiveAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/admin/users");
}
