import { z } from "zod";

export const reportSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana noto'g'ri formatda"),
  cashAmount: z.coerce.number().min(0),
  cardAmount: z.coerce.number().min(0),
  transferAmount: z.coerce.number().min(0),
  qrAmount: z.coerce.number().min(0),
  comment: z.string().max(2000).optional().or(z.literal("")),
});

export type ReportInput = z.infer<typeof reportSchema>;

export const objectSchema = z.object({
  nameUz: z.string().min(1).max(200),
  nameRu: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug faqat lotin harflari, raqam va tire bo'lishi mumkin"),
});

export type ObjectInput = z.infer<typeof objectSchema>;

export const organizationSchema = objectSchema.extend({
  commissionPercent: z.coerce.number().min(0).max(100),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;

export const createUserSchema = z
  .object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
    role: z.enum(["STAFF", "CASHIER"]),
    objectId: z.string().optional(),
    organizationId: z.string().optional(),
  })
  .refine((data) => data.role !== "STAFF" || !!data.objectId, {
    message: "Obyekt tanlanishi shart",
    path: ["objectId"],
  })
  .refine((data) => data.role !== "CASHIER" || !!data.organizationId, {
    message: "Tashkilot tanlanishi shart",
    path: ["organizationId"],
  });

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(6).max(100),
});

export const voucherSchema = z.object({
  objectId: z.string().min(1, "Obyekt tanlanishi shart"),
  guestCount: z.coerce.number().int().min(1, "Kamida 1 kishi bo'lishi kerak"),
  cashAmount: z.coerce.number().min(0),
  cardAmount: z.coerce.number().min(0),
  transferAmount: z.coerce.number().min(0),
  qrAmount: z.coerce.number().min(0),
});

export const redeemVoucherSchema = z.object({
  code: z.string().min(1, "Kod kiritilishi shart"),
});
