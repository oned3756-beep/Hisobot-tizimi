"use client";

import { useActionState, useState } from "react";
import { updateVoucherAction, type VoucherFormState } from "@/lib/actions/vouchers";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: VoucherFormState = { success: false };

export default function VoucherEditForm({
  voucher,
  t,
}: {
  voucher: {
    id: string;
    guestCount: number;
    cashAmount: number;
    cardAmount: number;
    transferAmount: number;
    qrAmount: number;
  };
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    updateVoucherAction,
    initialState,
  );
  const [amounts, setAmounts] = useState({
    cashAmount: voucher.cashAmount,
    cardAmount: voucher.cardAmount,
    transferAmount: voucher.transferAmount,
    qrAmount: voucher.qrAmount,
  });

  const total =
    (Number(amounts.cashAmount) || 0) +
    (Number(amounts.cardAmount) || 0) +
    (Number(amounts.transferAmount) || 0) +
    (Number(amounts.qrAmount) || 0);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="id" value={voucher.id} />

      {state.error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {t.voucherUpdated}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t.guestCount}
        </label>
        <input
          type="number"
          name="guestCount"
          min={1}
          step={1}
          defaultValue={voucher.guestCount}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.cash}
          </label>
          <input
            type="number"
            name="cashAmount"
            min={0}
            step="0.01"
            value={amounts.cashAmount}
            onChange={(e) =>
              setAmounts((a) => ({ ...a, cashAmount: Number(e.target.value) }))
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.card}
          </label>
          <input
            type="number"
            name="cardAmount"
            min={0}
            step="0.01"
            value={amounts.cardAmount}
            onChange={(e) =>
              setAmounts((a) => ({ ...a, cardAmount: Number(e.target.value) }))
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.transfer}
          </label>
          <input
            type="number"
            name="transferAmount"
            min={0}
            step="0.01"
            value={amounts.transferAmount}
            onChange={(e) =>
              setAmounts((a) => ({
                ...a,
                transferAmount: Number(e.target.value),
              }))
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.qr}
          </label>
          <input
            type="number"
            name="qrAmount"
            min={0}
            step="0.01"
            value={amounts.qrAmount}
            onChange={(e) =>
              setAmounts((a) => ({ ...a, qrAmount: Number(e.target.value) }))
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3">
        <span className="text-sm font-medium text-slate-600">{t.total}</span>
        <span className="text-lg font-semibold text-slate-900">
          {total.toLocaleString("en-US")}
        </span>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? t.saving : t.save}
      </button>
    </form>
  );
}
