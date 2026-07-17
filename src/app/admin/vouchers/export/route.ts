import ExcelJS from "exceljs";
import { auth } from "@/lib/auth";
import { todayInTashkent, daysAgoInTashkent, isValidDateString } from "@/lib/date";
import { listAllVouchers } from "@/lib/queries/vouchers";

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new Response("Ruxsat yo'q", { status: 403 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const objectIds = url.searchParams.getAll("objects");
  const statusParam = url.searchParams.get("status");
  const status: "UNUSED" | "USED" | undefined =
    statusParam === "UNUSED" ? "UNUSED" : statusParam === "USED" ? "USED" : undefined;

  const filter = {
    from: from && isValidDateString(from) ? from : daysAgoInTashkent(29),
    to: to && isValidDateString(to) ? to : todayInTashkent(),
    objectIds,
    status,
  };

  const vouchers = await listAllVouchers(filter);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vaucherlar");

  sheet.columns = [
    { header: "Kod", key: "code", width: 14 },
    { header: "Obyekt", key: "object", width: 24 },
    { header: "Tashkilot", key: "organization", width: 24 },
    { header: "Mehmon soni", key: "guestCount", width: 12 },
    { header: "Jami", key: "totalAmount", width: 14 },
    { header: "Komissiya foizi", key: "commissionPercent", width: 14 },
    { header: "Komissiya", key: "commissionAmount", width: 14 },
    { header: "Holat", key: "status", width: 14 },
    { header: "Kim sotgan", key: "soldBy", width: 16 },
    { header: "Kim qabul qilgan", key: "usedBy", width: 16 },
    { header: "Sotilgan vaqt", key: "soldAt", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const v of vouchers) {
    sheet.addRow({
      code: v.code,
      object: v.object.nameUz,
      organization: v.organization.nameUz,
      guestCount: v.guestCount,
      totalAmount: Number(v.totalAmount),
      commissionPercent: Number(v.commissionPercent),
      commissionAmount: v.status === "USED" ? Number(v.commissionAmount) : 0,
      status: v.status === "USED" ? "Ishlatilgan" : "Ishlatilmagan",
      soldBy: v.soldBy.username,
      usedBy: v.usedBy?.username ?? "",
      soldAt: formatDateTime(v.soldAt),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="vaucherlar_${filter.from}_${filter.to}.xlsx"`,
    },
  });
}
