import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getLocale";
import VoucherSellForm from "@/components/VoucherSellForm";

export default async function CashierPage() {
  const { locale, t } = await getDictionary();
  const objects = await prisma.businessObject.findMany({
    where: { isActive: true },
    orderBy: { nameUz: "asc" },
  });
  const objectOptions = objects.map((o) => ({
    id: o.id,
    nameUz: locale === "ru" ? o.nameRu : o.nameUz,
  }));

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.cashierSellTitle}
      </h1>
      <VoucherSellForm t={t} objects={objectOptions} />
    </div>
  );
}
