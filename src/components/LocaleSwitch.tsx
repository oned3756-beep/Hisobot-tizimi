import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/dictionaries";

export default function LocaleSwitch({
  locale,
  path,
}: {
  locale: Locale;
  path: string;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-md border border-slate-300 text-xs font-medium">
      {(["uz", "ru"] as const).map((code) => (
        <form action={setLocaleAction} key={code}>
          <input type="hidden" name="locale" value={code} />
          <input type="hidden" name="path" value={path} />
          <button
            type="submit"
            className={`px-2 py-1 uppercase transition ${
              locale === code
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {code}
          </button>
        </form>
      ))}
    </div>
  );
}
