import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/getLocale";
import UserCreateForm from "@/components/UserCreateForm";
import UserRow from "@/components/UserRow";

export default async function AdminUsersPage() {
  const { locale, t } = await getDictionary();
  const [users, objects] = await Promise.all([
    prisma.user.findMany({
      include: { object: true },
      orderBy: [{ role: "asc" }, { username: "asc" }],
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
        {t.usersTitle}
      </h1>

      <UserCreateForm objects={objectOptions} t={t} />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-2 py-2 font-medium">{t.login}</th>
              <th className="px-2 py-2 font-medium">{t.objectOrRole}</th>
              <th className="px-2 py-2 text-center font-medium">
                {t.status}
              </th>
              <th className="px-2 py-2 font-medium">{t.password}</th>
              <th className="px-2 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow
                key={u.id}
                t={t}
                user={{
                  id: u.id,
                  username: u.username,
                  role: u.role,
                  isActive: u.isActive,
                  objectName: u.object
                    ? locale === "ru"
                      ? u.object.nameRu
                      : u.object.nameUz
                    : null,
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
