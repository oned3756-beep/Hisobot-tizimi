import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getVoucherForCashier,
  cashierUpdateVoucherAction,
} from "@/lib/actions/vouchers";
import { getDictionary } from "@/lib/i18n/getLocale";
import VoucherEditForm from "@/components/VoucherEditForm";

export default async function CashierVoucherEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const { locale, t } = await getDictionary();
  const voucher = await getVoucherForCashier(id, session!.user.id);

  if (!voucher) {
    notFound();
  }
  // Ishlatilgan vaucherni kassir tahrirlay olmaydi
  if (voucher.status === "USED") {
    redirect("/cashier/history");
  }

  const objectName = locale === "ru" ? voucher.object.nameRu : voucher.object.nameUz;
  const organizationName =
    locale === "ru" ? voucher.organization.nameRu : voucher.organization.nameUz;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          {t.editVoucherTitle} — {voucher.code}
        </h1>
        <Link
          href="/cashier/history"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
        >
          {t.backToVouchers}
        </Link>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        {objectName} — {organizationName}
      </p>
      <VoucherEditForm
        voucher={{
          id: voucher.id,
          guestCount: voucher.guestCount,
          cashAmount: Number(voucher.cashAmount),
          cardAmount: Number(voucher.cardAmount),
          transferAmount: Number(voucher.transferAmount),
          qrAmount: Number(voucher.qrAmount),
        }}
        action={cashierUpdateVoucherAction}
        t={t}
      />
    </div>
  );
}
