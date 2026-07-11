import Link from "next/link";
import { auth } from "@/lib/auth";
import { listReportsForObject } from "@/lib/actions/report";
import { getDictionary } from "@/lib/i18n/getLocale";

type OrgEntry = { organization: { nameUz: string; nameRu: string }; visitorCount: number };

function VisitorCell({
  count,
  entries,
  locale,
}: {
  count: number;
  entries: OrgEntry[];
  locale: string;
}) {
  if (entries.length === 0) return <>{count}</>;
  return (
    <details>
      <summary className="cursor-pointer">{count}</summary>
      <ul className="mt-1 text-xs text-slate-500">
        {entries.map((e, i) => (
          <li key={i}>
            {locale === "ru" ? e.organization.nameRu : e.organization.nameUz}:{" "}
            {e.visitorCount}
          </li>
        ))}
      </ul>
    </details>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
}

function formatNumber(n: number | string) {
  return Number(n).toLocaleString("en-US");
}

export default async function ReportHistoryPage() {
  const session = await auth();
  const { locale, t } = await getDictionary();
  const objectId = session!.user.objectId!;
  const reports = await listReportsForObject(objectId, 60);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.historyTitle}
      </h1>

      {reports.length === 0 ? (
        <p className="text-sm text-slate-500">{t.noReportsYet}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-max text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">{t.date}</th>
                <th className="px-4 py-2 font-medium">{t.visitorCount}</th>
                <th className="px-4 py-2 font-medium">{t.cash}</th>
                <th className="px-4 py-2 font-medium">{t.card}</th>
                <th className="px-4 py-2 font-medium">{t.transfer}</th>
                <th className="px-4 py-2 font-medium">{t.qr}</th>
                <th className="px-4 py-2 font-medium">{t.total}</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const dateStr = formatDate(r.date);
                return (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-4 py-2 text-slate-800">{dateStr}</td>
                    <td className="px-4 py-2 text-slate-600">
                      <VisitorCell
                        count={r.visitorCount}
                        entries={r.organizationEntries}
                        locale={locale}
                      />
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {formatNumber(r.cashAmount.toString())}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {formatNumber(r.cardAmount.toString())}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {formatNumber(r.transferAmount.toString())}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {formatNumber(r.qrAmount.toString())}
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {formatNumber(r.totalAmount.toString())}
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/report?date=${dateStr}`}
                        className="text-slate-500 hover:text-slate-900"
                      >
                        {t.edit}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
