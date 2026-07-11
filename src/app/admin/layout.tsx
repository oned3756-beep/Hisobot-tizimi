import Link from "next/link";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import LocaleSwitch from "@/components/LocaleSwitch";
import { getDictionary } from "@/lib/i18n/getLocale";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const { locale, t } = await getDictionary();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/admin" className="hover:text-slate-900">
              {t.navReports}
            </Link>
            <Link href="/admin/objects" className="hover:text-slate-900">
              {t.navObjects}
            </Link>
            <Link href="/admin/organizations" className="hover:text-slate-900">
              {t.navOrganizations}
            </Link>
            <Link href="/admin/users" className="hover:text-slate-900">
              {t.navUsers}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <LocaleSwitch locale={locale} path="/admin" />
            <span className="text-sm text-slate-500">
              {session?.user?.name}
            </span>
            <LogoutButton label={t.logout} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
