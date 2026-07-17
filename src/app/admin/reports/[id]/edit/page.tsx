import Link from "next/link";
import { notFound } from "next/navigation";
import { getReportById } from "@/lib/actions/report";
import { getDictionary } from "@/lib/i18n/getLocale";
import AdminReportEditForm from "@/components/AdminReportEditForm";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
}

export default async function AdminReportEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getDictionary();
  const report = await getReportById(id);

  if (!report) {
    notFound();
  }

  const objectName = locale === "ru" ? report.object.nameRu : report.object.nameUz;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          {t.editReportTitle} — {objectName} ({formatDate(report.date)})
        </h1>
        <Link
          href="/admin"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
        >
          {t.backToReports}
        </Link>
      </div>
      <AdminReportEditForm
        report={{
          id: report.id,
          visitorCount: report.visitorCount,
          cashAmount: Number(report.cashAmount),
          cardAmount: Number(report.cardAmount),
          transferAmount: Number(report.transferAmount),
          qrAmount: Number(report.qrAmount),
          comment: report.comment ?? "",
        }}
        t={t}
      />
    </div>
  );
}
