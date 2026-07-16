export type ReportNotification = {
  objectNameUz: string;
  date: string;
  visitorCount: number;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  qrAmount: number;
  totalAmount: number;
  comment?: string;
  organizations: { name: string; visitorCount: number }[];
};

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

export function buildMessage(r: ReportNotification): string {
  const lines = [
    `📋 <b>${escapeHtml(r.objectNameUz)}</b>`,
    `Sana: ${r.date}`,
    `Odam soni: ${r.visitorCount}`,
  ];
  for (const org of r.organizations) {
    lines.push(`  • ${escapeHtml(org.name)}: ${org.visitorCount}`);
  }
  lines.push(
    `💰 Naqd: ${formatNumber(r.cashAmount)}`,
    `💳 Karta: ${formatNumber(r.cardAmount)}`,
    `🏦 Perechisleniye: ${formatNumber(r.transferAmount)}`,
    `📱 QR-kod: ${formatNumber(r.qrAmount)}`,
    `💵 Jami: ${formatNumber(r.totalAmount)}`,
  );
  if (r.comment) {
    lines.push(`📝 ${escapeHtml(r.comment)}`);
  }
  return lines.join("\n");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function notifyReportSaved(report: ReportNotification): void {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = buildMessage(report);
  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  }).catch((err) => {
    console.error("Telegram notification failed:", err);
  });
}
