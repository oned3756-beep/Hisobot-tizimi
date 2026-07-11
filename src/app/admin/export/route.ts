import ExcelJS from "exceljs";
import { auth } from "@/lib/auth";
import { todayInTashkent, daysAgoInTashkent, isValidDateString } from "@/lib/date";
import { listAdminReports } from "@/lib/queries/adminReports";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
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

  const filter = {
    from: from && isValidDateString(from) ? from : daysAgoInTashkent(29),
    to: to && isValidDateString(to) ? to : todayInTashkent(),
    objectIds,
  };

  const reports = await listAdminReports(filter);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Hisobotlar");

  sheet.columns = [
    { header: "Sana", key: "date", width: 12 },
    { header: "Obyekt", key: "object", width: 24 },
    { header: "Odam soni", key: "visitorCount", width: 12 },
    { header: "Naqd", key: "cashAmount", width: 14 },
    { header: "Karta", key: "cardAmount", width: 14 },
    { header: "Perechisleniye", key: "transferAmount", width: 16 },
    { header: "QR-kod", key: "qrAmount", width: 14 },
    { header: "Jami", key: "totalAmount", width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const r of reports) {
    sheet.addRow({
      date: formatDate(r.date),
      object: r.object.nameUz,
      visitorCount: r.visitorCount,
      cashAmount: Number(r.cashAmount),
      cardAmount: Number(r.cardAmount),
      transferAmount: Number(r.transferAmount),
      qrAmount: Number(r.qrAmount),
      totalAmount: Number(r.totalAmount),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="hisobot_${filter.from}_${filter.to}.xlsx"`,
    },
  });
}
