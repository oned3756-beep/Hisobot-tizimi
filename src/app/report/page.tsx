import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReportForDate } from "@/lib/actions/report";
import { todayInTashkent, isValidDateString } from "@/lib/date";
import { getDictionary } from "@/lib/i18n/getLocale";
import ReportForm from "@/components/ReportForm";
import DateNav from "@/components/DateNav";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  const { locale, t } = await getDictionary();
  const { date: rawDate } = await searchParams;
  const date =
    rawDate && isValidDateString(rawDate) ? rawDate : todayInTashkent();

  const objectId = session!.user.objectId!;
  const [report, organizations] = await Promise.all([
    getReportForDate(objectId, date),
    prisma.organization.findMany({
      where: { isActive: true },
      orderBy: { nameUz: "asc" },
    }),
  ]);

  const organizationOptions = organizations.map((o) => ({
    id: o.id,
    name: locale === "ru" ? o.nameRu : o.nameUz,
  }));

  const orgCountsById: Record<string, number> = {};
  for (const entry of report?.organizationEntries ?? []) {
    orgCountsById[entry.organizationId] = entry.visitorCount;
  }

  const initial = report
    ? {
        visitorCount: report.visitorCount,
        cashAmount: Number(report.cashAmount),
        cardAmount: Number(report.cardAmount),
        transferAmount: Number(report.transferAmount),
        qrAmount: Number(report.qrAmount),
        comment: report.comment ?? "",
      }
    : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          {t.dailyReport}
        </h1>
        <DateNav date={date} basePath="/report" />
      </div>
      <ReportForm
        date={date}
        initial={initial}
        t={t}
        organizations={organizationOptions}
        initialOrgCounts={orgCountsById}
      />
    </div>
  );
}
