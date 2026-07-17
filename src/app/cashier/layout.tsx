import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import LocaleSwitch from "@/components/LocaleSwitch";
import { getDictionary } from "@/lib/i18n/getLocale";

export default async function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const { locale, t } = await getDictionary();
  const organization = session?.user?.organizationId
    ? await prisma.organization.findUnique({
        where: { id: session.user.organizationId },
      })
    : null;
  const organizationName = organization
    ? locale === "ru"
      ? organization.nameRu
      : organization.nameUz
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/cashier" className="hover:text-slate-900">
              {t.navSellVoucher}
            </Link>
            <Link href="/cashier/history" className="hover:text-slate-900">
              {t.navVoucherHistory}
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <LocaleSwitch locale={locale} path="/cashier" />
            <span className="text-sm text-slate-500">{organizationName}</span>
            <LogoutButton label={t.logout} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
