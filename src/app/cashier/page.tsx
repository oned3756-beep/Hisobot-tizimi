import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getLocale";
import VoucherSellForm from "@/components/VoucherSellForm";

export default async function CashierPage() {
  const { locale, t } = await getDictionary();
  const [objects, services] = await Promise.all([
    prisma.businessObject.findMany({
      where: { isActive: true },
      orderBy: { nameUz: "asc" },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const objectOptions = objects.map((o) => ({
    id: o.id,
    nameUz: locale === "ru" ? o.nameRu : o.nameUz,
  }));

  const servicesByObject: Record<
    string,
    { id: string; name: string; price: number }[]
  > = {};
  for (const s of services) {
    (servicesByObject[s.objectId] ??= []).push({
      id: s.id,
      name: s.name,
      price: Number(s.price),
    });
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.cashierSellTitle}
      </h1>
      <VoucherSellForm
        t={t}
        objects={objectOptions}
        servicesByObject={servicesByObject}
      />
    </div>
  );
}
