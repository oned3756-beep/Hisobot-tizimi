import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { todayInTashkent, daysAgoInTashkent, isValidDateString } from "@/lib/date";
import { listAdminReports, getAdminSummary } from "@/lib/queries/adminReports";
import { getDictionary } from "@/lib/i18n/getLocale";
import AdminFilters from "@/components/AdminFilters";

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; objects?: string | string[] }>;
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

  const objects = await prisma.businessObject.findMany({
    where: { isActive: true },
    orderBy: { nameUz: "asc" },
  });
  const objectOptions = objects.map((o) => ({
    id: o.id,
    nameUz: locale === "ru" ? o.nameRu : o.nameUz,
  }));

  const filter = { from, to, objectIds };
  const [reports, summary] = await Promise.all([
    listAdminReports(filter),
    getAdminSummary(filter),
  ]);

  const exportParams = new URLSearchParams();
  exportParams.set("from", from);
  exportParams.set("to", to);
  objectIds.forEach((id) => exportParams.append("objects", id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          {t.navReports}
        </h1>
        <a
          href={`/admin/export?${exportParams.toString()}`}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
        >
          {t.exportExcel}
        </a>
      </div>

      <AdminFilters from={from} to={to} selectedIds={objectIds} objects={objectOptions} t={t} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label={t.visitorCount} value={formatNumber(summary.visitorCount)} />
        <SummaryCard label={t.cash} value={formatNumber(summary.cashAmount)} />
        <SummaryCard label={t.card} value={formatNumber(summary.cardAmount)} />
        <SummaryCard label={t.transfer} value={formatNumber(summary.transferAmount)} />
        <SummaryCard label={t.qr} value={formatNumber(summary.qrAmount)} />
        <SummaryCard label={t.total} value={formatNumber(summary.totalAmount)} highlight />
      </div>

      {reports.length === 0 ? (
        <p className="text-sm text-slate-500">{t.noDataFound}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">{t.date}</th>
                <th className="px-4 py-2 font-medium">{t.object}</th>
                <th className="px-4 py-2 font-medium">{t.visitorCount}</th>
                <th className="px-4 py-2 font-medium">{t.cash}</th>
                <th className="px-4 py-2 font-medium">{t.card}</th>
                <th className="px-4 py-2 font-medium">{t.transfer}</th>
                <th className="px-4 py-2 font-medium">{t.qr}</th>
                <th className="px-4 py-2 font-medium">{t.total}</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 text-slate-800">
                    {formatDate(r.date)}
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {locale === "ru" ? r.object.nameRu : r.object.nameUz}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {r.organizationEntries.length === 0 ? (
                      r.visitorCount
                    ) : (
                      <details>
                        <summary className="cursor-pointer">
                          {r.visitorCount}
                        </summary>
                        <ul className="mt-1 text-xs text-slate-500">
                          {r.organizationEntries.map((e) => (
                            <li key={e.id}>
                              {locale === "ru"
                                ? e.organization.nameRu
                                : e.organization.nameUz}
                              : {e.visitorCount}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {formatNumber(Number(r.cashAmount))}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {formatNumber(Number(r.cardAmount))}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {formatNumber(Number(r.transferAmount))}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {formatNumber(Number(r.qrAmount))}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {formatNumber(Number(r.totalAmount))}
                  </td>
                  <td className="px-4 py-2">
                    {r._count.revisions > 0 && (
                      <Link
                        href={`/admin/reports/${r.id}/history`}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        {t.historyLink}
                      </Link>
                    )}
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
