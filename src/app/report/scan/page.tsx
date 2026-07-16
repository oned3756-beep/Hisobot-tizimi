import { getDictionary } from "@/lib/i18n/getLocale";
import QrScanner from "@/components/QrScanner";

export default async function ScanPage() {
  const { t } = await getDictionary();

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">
        {t.scanTitle}
      </h1>
      <QrScanner t={t} />
    </div>
  );
}
