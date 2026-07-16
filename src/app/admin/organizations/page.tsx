import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getLocale";
import OrganizationCreateForm from "@/components/OrganizationCreateForm";
import OrganizationRow from "@/components/OrganizationRow";

export default async function AdminOrganizationsPage() {
  const { t } = await getDictionary();
  const [organizations, objects] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { nameUz: "asc" },
      include: { objectLinks: true },
    }),
    prisma.businessObject.findMany({
      where: { isActive: true },
      orderBy: { nameUz: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.organizationsTitle}
      </h1>

      <OrganizationCreateForm t={t} objects={objects} />

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
            {organizations.map((org) => (
              <OrganizationRow
                key={org.id}
                organization={{
                  ...org,
                  linkedObjectIds: org.objectLinks.map((l) => l.objectId),
                }}
                objects={objects}
                t={t}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
