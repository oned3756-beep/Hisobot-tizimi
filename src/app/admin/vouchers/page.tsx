import { prisma } from "@/lib/prisma";
import { todayInTashkent, daysAgoInTashkent, isValidDateString } from "@/lib/date";
import { listAllVouchers, getVoucherSummary } from "@/lib/queries/vouchers";
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

export default async function AdminVouchersPage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    objects?: string | string[];
    status?: string;
  }>;
}) {
  const sp = await searchParams;
  const { locale, t } = await getDictionary();
  const from = sp.from && isValidDateString(sp.from) ? sp.from : daysAgoInTashkent(29);
  const to = sp.to && isValidDateString(sp.to) ? sp.to : todayInTashkent();
  const objectIds = sp.objects
    ? Array.isArray(sp.objects)
      ? sp.objects
      : [sp.objects]
    : [];
  const status: "UNUSED" | "USED" | undefined =
    sp.status === "UNUSED" ? "UNUSED" : sp.status === "USED" ? "USED" : undefined;

  const objects = await prisma.businessObject.findMany({
    where: { isActive: true },
    orderBy: { nameUz: "asc" },
  });

  const filter = { from, to, objectIds, status };
  const [vouchers, summary] = await Promise.all([
    listAllVouchers(filter),
    getVoucherSummary(filter),
  ]);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.adminVouchersTitle}
      </h1>

      <form
        method="GET"
        className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            {t.fromDate}
          </label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            {t.toDate}
          </label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            {t.statusLabel}
          </label>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="">{t.allStatuses}</option>
            <option value="UNUSED">{t.voucherStatusUnused}</option>
            <option value="USED">{t.voucherStatusUsed}</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="mb-1 block w-full text-xs font-medium text-slate-500">
            {t.objectsLabel}
          </span>
          {objects.map((obj) => (
            <label
              key={obj.id}
              className="flex items-center gap-1.5 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                name="objects"
                value={obj.id}
                defaultChecked={
                  objectIds.length === 0 || objectIds.includes(obj.id)
                }
                className="rounded border-slate-300"
              />
              {locale === "ru" ? obj.nameRu : obj.nameUz}
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {t.filter}
        </button>
      </form>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label={t.soldCount} value={formatNumber(summary.soldCount)} />
        <SummaryCard label={t.usedCount} value={formatNumber(summary.count)} />
        <SummaryCard label={t.visitorCount} value={formatNumber(summary.guestCount)} />
        <SummaryCard label={t.total} value={formatNumber(summary.totalAmount)} highlight />
      </div>

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
                <th className="px-4 py-2 font-medium">{t.soldBy}</th>
                <th className="px-4 py-2 font-medium">{t.usedBy}</th>
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
                    {v.soldBy.username}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {v.usedBy?.username ?? "—"}
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

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        highlight
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`text-xs font-medium ${
          highlight ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
