import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { getVoucherForCashier } from "@/lib/actions/vouchers";
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
  const session = await auth();
  const { locale, t } = await getDictionary();
  const voucher = await getVoucherForCashier(id, session!.user.id);

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

  const exact = {
    WebkitPrintColorAdjust: "exact",
    printColorAdjust: "exact",
  } as const;

  const Stub = ({ label }: { label: string }) => (
    <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none">
      {/* Rangli sarlavha lentasi */}
      <div
        className="flex items-center justify-between px-6 py-3 text-white"
        style={{
          ...exact,
          background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🎟️</span>
          <span className="text-sm font-bold tracking-[0.15em]">
            {organizationName}
          </span>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-[0.15em]">
          {label}
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-6 p-6">
        <div className="flex flex-col items-center">
          <div className="rounded-xl border-2 border-emerald-100 bg-white p-2">
            <img src={qrDataUrl} alt={voucher.code} className="h-36 w-36" />
          </div>
          <div className="mt-2 rounded-md bg-slate-900 px-3 py-1 font-mono text-base font-bold tracking-widest text-white" style={exact}>
            {voucher.code}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2">
          <div className="text-2xl font-bold text-slate-900">{objectName}</div>
          {voucher.serviceName && (
            <div
              className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700"
              style={exact}
            >
              {voucher.serviceName}
            </div>
          )}
          <div className="mt-1 flex items-center justify-between border-b border-dotted border-slate-200 py-1 text-sm">
            <span className="text-slate-500">{t.guestCount}</span>
            <span className="text-base font-bold text-slate-900">
              {voucher.guestCount}
            </span>
          </div>
          <div className="flex items-baseline justify-between py-1">
            <span className="text-sm text-slate-500">{t.total}</span>
            <span className="text-2xl font-extrabold text-emerald-700" style={exact}>
              {formatNumber(Number(voucher.totalAmount))}
              <span className="ml-1 text-xs font-medium text-slate-400">
                so&apos;m
              </span>
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
