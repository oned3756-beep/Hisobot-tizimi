import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getLocale";
import ObjectCreateForm from "@/components/ObjectCreateForm";
import ObjectRow from "@/components/ObjectRow";

export default async function AdminObjectsPage() {
  const { t } = await getDictionary();
  const objects = await prisma.businessObject.findMany({
    orderBy: { nameUz: "asc" },
  });

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.objectsTitle}
      </h1>

      <ObjectCreateForm t={t} />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-2 py-2 font-medium">{t.nameSlugHeader}</th>
              <th className="px-2 py-2 text-center font-medium">
                {t.status}
              </th>
              <th className="px-2 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {objects.map((obj) => (
              <ObjectRow key={obj.id} object={obj} t={t} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
