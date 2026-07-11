"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Locale } from "./dictionaries";

export async function setLocaleAction(formData: FormData) {
  const locale = formData.get("locale") as Locale;
  const store = await cookies();
  store.set("locale", locale === "ru" ? "ru" : "uz", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  const path = (formData.get("path") as string) || "/";
  revalidatePath(path);
}
