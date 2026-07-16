import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportWithRevisions } from "@/lib/actions/report";
import { getDictionary } from "@/lib/i18n/getLocale";

type Snapshot = {
  visitorCount: number;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  qrAmount: number;
  totalAmount: number;
  comment: string | null;
  organizationEntries: { organizationName: string; visitorCount: number }[];
};

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

export default async function ReportHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getDictionary();
  const report = await getReportWithRevisions(id);

  if (!report) {
    notFound();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          {t.revisionsTitle} — {locale === "ru" ? report.object.nameRu : report.object.nameUz}
        </h1>
        <Link
          href="/admin"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
        >
          {t.backToReports}
        </Link>
      </div>

      {report.revisions.length === 0 ? (
        <p className="text-sm text-slate-500">{t.noRevisions}</p>
      ) : (
        <div className="space-y-4">
          {report.revisions.map((rev) => {
            const s = rev.snapshot as unknown as Snapshot;
            return (
              <div
                key={rev.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    {t.editedBy}: <strong className="text-slate-800">{rev.editedBy.username}</strong>
                  </span>
                  <span>
                    {t.editedAt}: {formatDateTime(rev.editedAt)}
                  </span>
                </div>
                <div className="mb-2 text-xs font-medium text-slate-500">
                  {t.previousValues}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-700 sm:grid-cols-3">
                  <div>
                    {t.visitorCount}: <strong>{s.visitorCount}</strong>
                  </div>
                  <div>
                    {t.cash}: <strong>{formatNumber(s.cashAmount)}</strong>
                  </div>
                  <div>
                    {t.card}: <strong>{formatNumber(s.cardAmount)}</strong>
                  </div>
                  <div>
                    {t.transfer}: <strong>{formatNumber(s.transferAmount)}</strong>
                  </div>
                  <div>
                    {t.qr}: <strong>{formatNumber(s.qrAmount)}</strong>
                  </div>
                  <div>
                    {t.total}: <strong>{formatNumber(s.totalAmount)}</strong>
                  </div>
                </div>
                {s.organizationEntries.length > 0 && (
                  <ul className="mt-2 text-xs text-slate-500">
                    {s.organizationEntries.map((e, i) => (
                      <li key={i}>
                        {e.organizationName}: {e.visitorCount}
                      </li>
                    ))}
                  </ul>
                )}
                {s.comment && (
                  <p className="mt-2 text-xs text-slate-500">{s.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
