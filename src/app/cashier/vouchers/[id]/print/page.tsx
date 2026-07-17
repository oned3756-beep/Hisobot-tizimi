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

  const qrDataUrl = await QRCode.toDataURL(voucher.code, {
    width: 240,
    margin: 1,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  const objectName = locale === "ru" ? voucher.object.nameRu : voucher.object.nameUz;
  const organizationName =
    locale === "ru" ? voucher.organization.nameRu : voucher.organization.nameUz;
  const soldAt = formatDateTime(voucher.soldAt);

  const Stub = ({ label }: { label: string }) => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm print:break-inside-avoid print:shadow-none">
      <div
        className="flex items-center justify-between bg-slate-900 px-6 py-3 text-white"
        style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
      >
        <span className="text-xs font-bold tracking-[0.2em]">{label}</span>
        <span className="text-xs font-medium text-slate-300">
          {organizationName}
        </span>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-6 bg-white p-6">
        <div className="flex flex-col items-center">
          <div className="rounded-xl border-2 border-slate-200 p-2">
            <img src={qrDataUrl} alt={voucher.code} className="h-36 w-36" />
          </div>
          <div className="mt-2 font-mono text-lg font-bold tracking-widest text-slate-900">
            {voucher.code}
          </div>
        </div>
        <div className="flex flex-col justify-center gap-1.5">
          <div className="text-xl font-semibold text-slate-900">
            {objectName}
          </div>
          <div className="flex items-center justify-between border-b border-dotted border-slate-200 py-1 text-sm">
            <span className="text-slate-500">{t.guestCount}</span>
            <span className="font-semibold text-slate-900">
              {voucher.guestCount}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-dotted border-slate-200 py-1 text-sm">
            <span className="text-slate-500">{t.total}</span>
            <span className="font-semibold text-slate-900">
              {formatNumber(Number(voucher.totalAmount))}
            </span>
          </div>
          <div className="pt-1 text-xs text-slate-400">
            {t.soldAt}: {soldAt}
          </div>
        </div>
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

      <div className="space-y-3">
        <Stub label={t.guestCopy} />

        <div className="flex items-center gap-3 text-slate-300">
          <div className="flex-1 border-t-2 border-dashed border-slate-300" />
          <span aria-hidden className="text-base">
            ✂
          </span>
          <div className="flex-1 border-t-2 border-dashed border-slate-300" />
        </div>

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
