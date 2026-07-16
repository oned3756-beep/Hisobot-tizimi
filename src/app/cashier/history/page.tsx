import { auth } from "@/lib/auth";
import { listVouchersForCashier } from "@/lib/actions/vouchers";
import { getDictionary } from "@/lib/i18n/getLocale";

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

export default async function CashierHistoryPage() {
  const session = await auth();
  const { locale, t } = await getDictionary();
  const vouchers = await listVouchersForCashier(session!.user.id, 100);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.cashierHistoryTitle}
      </h1>

      {vouchers.length === 0 ? (
        <p className="text-sm text-slate-500">{t.noVouchers}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">{t.voucherCode}</th>
                <th className="px-4 py-2 font-medium">{t.object}</th>
                <th className="px-4 py-2 font-medium">{t.guestCount}</th>
                <th className="px-4 py-2 font-medium">{t.total}</th>
                <th className="px-4 py-2 font-medium">{t.statusLabel}</th>
                <th className="px-4 py-2 font-medium">{t.soldAt}</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-mono text-slate-800">
                    {v.code}
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {locale === "ru" ? v.object.nameRu : v.object.nameUz}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{v.guestCount}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {formatNumber(Number(v.totalAmount))}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.status === "USED"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {v.status === "USED"
                        ? t.voucherStatusUsed
                        : t.voucherStatusUnused}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {formatDateTime(v.soldAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
