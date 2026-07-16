import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getVoucherById } from "@/lib/actions/vouchers";
import { getDictionary } from "@/lib/i18n/getLocale";
import PrintButton from "@/components/PrintButton";

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default async function VoucherPrintPage({
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

  const qrDataUrl = await QRCode.toDataURL(voucher.code, { width: 220, margin: 1 });
  const objectName = locale === "ru" ? voucher.object.nameRu : voucher.object.nameUz;
  const soldAt = formatDateTime(voucher.soldAt);

  const Stub = ({ label }: { label: string }) => (
    <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center">
      <div className="mb-3 text-xs font-bold tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mb-2 text-lg font-semibold text-slate-900">
        {objectName}
      </div>
      <img
        src={qrDataUrl}
        alt={voucher.code}
        className="mx-auto mb-3 h-40 w-40"
      />
      <div className="mb-1 font-mono text-xl font-bold tracking-widest text-slate-900">
        {voucher.code}
      </div>
      <div className="text-sm text-slate-600">
        {t.guestCount}: <strong>{voucher.guestCount}</strong>
      </div>
      <div className="text-sm text-slate-600">
        {t.total}: <strong>{formatNumber(Number(voucher.totalAmount))}</strong>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        {t.soldAt}: {soldAt}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h1 className="text-lg font-semibold text-slate-900">
          {objectName}
        </h1>
        <PrintButton label={t.printVoucher} />
      </div>

      <div className="space-y-6">
        <Stub label={t.guestCopy} />
        <Stub label={t.sellerCopy} />
      </div>

      <a
        href="/cashier"
        className="mt-6 inline-block text-sm text-slate-500 hover:text-slate-900 print:hidden"
      >
        {t.backToSell}
      </a>
    </div>
  );
}
