import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getLocale";
import ServiceCreateForm from "@/components/ServiceCreateForm";
import ServiceRow from "@/components/ServiceRow";

export default async function AdminServicesPage() {
  const { locale, t } = await getDictionary();
  const [services, objects] = await Promise.all([
    prisma.service.findMany({
      include: { object: true },
      orderBy: [{ object: { nameUz: "asc" } }, { name: "asc" }],
    }),
    prisma.businessObject.findMany({
      where: { isActive: true },
      orderBy: { nameUz: "asc" },
    }),
  ]);

  const objectOptions = objects.map((o) => ({
    id: o.id,
    nameUz: locale === "ru" ? o.nameRu : o.nameUz,
  }));

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.servicesTitle}
      </h1>

      <ServiceCreateForm objects={objectOptions} t={t} />

      {services.length === 0 ? (
        <p className="text-sm text-slate-500">{t.noDataFound}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-2 py-2 font-medium">{t.object}</th>
                <th className="px-2 py-2 font-medium">
                  {t.serviceName} / {t.price}
                </th>
                <th className="px-2 py-2 text-center font-medium">
                  {t.status}
                </th>
                <th className="px-2 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <ServiceRow
                  key={s.id}
                  service={{
                    id: s.id,
                    objectId: s.objectId,
                    name: s.name,
                    price: Number(s.price),
                    isActive: s.isActive,
                  }}
                  objectName={locale === "ru" ? s.object.nameRu : s.object.nameUz}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
