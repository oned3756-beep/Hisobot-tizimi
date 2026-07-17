"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { redeemVoucherAction, type RedeemState } from "@/lib/actions/vouchers";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: RedeemState = { success: false };

export default function QrScanner({ t }: { t: Dictionary }) {
  const [state, formAction, pending] = useActionState(
    redeemVoucherAction,
    initialState,
  );
  const [scanKey, setScanKey] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);
  const scannerDivId = "qr-reader";

  const showResult = (state.success || state.error) && !dismissed;

  useEffect(() => {
    if (showResult) return;

    let cancelled = false;
    let scannerInstance: { clear: () => Promise<void> } | null = null;
    // Har yangi skaner sessiyasida faqat bitta yuborishga ruxsat beramiz —
    // kamera bir QR'ni ketma-ket o'qib, ikki marta qabul qilib yubormasligi uchun.
    submittedRef.current = false;

    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (cancelled) return;
      const scanner = new Html5QrcodeScanner(
        scannerDivId,
        { fps: 10, qrbox: 220 },
        false,
      );
      scanner.render(
        (decodedText: string) => {
          if (submittedRef.current) return;
          submittedRef.current = true;
          if (codeInputRef.current) {
            codeInputRef.current.value = decodedText.trim();
          }
          formRef.current?.requestSubmit();
        },
        () => {},
      );
      scannerInstance = scanner;
    });

    return () => {
      cancelled = true;
      scannerInstance?.clear().catch(() => {});
    };
  }, [scanKey, showResult]);

  return (
    <div className="space-y-4">
      {showResult && state.success && (
        <div className="rounded-md bg-green-50 px-4 py-4 text-center">
          <div className="text-2xl">✅</div>
          <div className="text-lg font-semibold text-green-700">
            {state.guestCount} {t.redeemedGuests}
          </div>
        </div>
      )}
      {showResult && state.error && (
        <div className="rounded-md bg-red-50 px-4 py-4 text-center text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}

      {showResult ? (
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            setScanKey((k) => k + 1);
            if (codeInputRef.current) codeInputRef.current.value = "";
          }}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {t.scanAgain}
        </button>
      ) : (
        <div id={scannerDivId} />
      )}

      <form
        ref={formRef}
        action={(formData) => {
          setDismissed(false);
          formAction(formData);
        }}
        className="flex gap-2"
      >
        <input
          ref={codeInputRef}
          name="code"
          placeholder={t.enterCodeManually}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm uppercase focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {t.redeem}
        </button>
      </form>
    </div>
  );
}
