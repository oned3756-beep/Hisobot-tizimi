"use client";

import { useActionState, useState } from "react";
import {
  createVoucherAction,
  type VoucherFormState,
} from "@/lib/actions/vouchers";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: VoucherFormState = { success: false };

export default function VoucherSellForm({
  t,
  objects,
}: {
  t: Dictionary;
  objects: { id: string; nameUz: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createVoucherAction,
    initialState,
  );
  const [amounts, setAmounts] = useState({
    cashAmount: 0,
    cardAmount: 0,
    transferAmount: 0,
    qrAmount: 0,
  });

  const total =
    (Number(amounts.cashAmount) || 0) +
    (Number(amounts.cardAmount) || 0) +
    (Number(amounts.transferAmount) || 0) +
    (Number(amounts.qrAmount) || 0);

  const fieldError = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t.object}
        </label>
        <select
          name="objectId"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">{t.selectObject}</option>
          {objects.map((obj) => (
            <option key={obj.id} value={obj.id}>
              {obj.nameUz}
            </option>
          ))}
        </select>
        {fieldError("objectId") && (
          <p className="mt-1 text-xs text-red-600">{fieldError("objectId")}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t.guestCount}
        </label>
        <input
          type="number"
          name="guestCount"
          min={1}
          step={1}
          defaultValue={1}
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        {fieldError("guestCount") && (
          <p className="mt-1 text-xs text-red-600">{fieldError("guestCount")}</p>
        )}
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
        {pending ? t.adding : t.createVoucher}
      </button>
    </form>
  );
}
