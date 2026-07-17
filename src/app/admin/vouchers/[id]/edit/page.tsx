import Link from "next/link";
import { notFound } from "next/navigation";
import { getVoucherById } from "@/lib/actions/vouchers";
import { getDictionary } from "@/lib/i18n/getLocale";
import VoucherEditForm from "@/components/VoucherEditForm";

export default async function VoucherEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getDictionary();
  const voucher = await getVoucherById(id);

  if (!voucher) {
    notFound();
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
          href="/admin/vouchers"
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
        t={t}
      />
    </div>
  );
}
