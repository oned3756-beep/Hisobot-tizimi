import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import LocaleSwitch from "@/components/LocaleSwitch";
import { getDictionary } from "@/lib/i18n/getLocale";
import Link from "next/link";

export default async function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const { locale, t } = await getDictionary();
  const object = session?.user?.objectId
    ? await prisma.businessObject.findUnique({
        where: { id: session.user.objectId },
      })
    : null;
  const objectName = object
    ? locale === "ru"
      ? object.nameRu
      : object.nameUz
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/report" className="hover:text-slate-900">
              {t.navTodayReport}
            </Link>
            <Link href="/report/history" className="hover:text-slate-900">
              {t.navHistory}
            </Link>
            <Link href="/report/scan" className="hover:text-slate-900">
              {t.navScanVoucher}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <LocaleSwitch locale={locale} path="/report" />
            <span className="text-sm text-slate-500">{objectName}</span>
            <LogoutButton label={t.logout} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
