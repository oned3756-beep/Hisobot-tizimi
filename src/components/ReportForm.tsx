"use client";

import { useActionState, useState } from "react";
import { saveReportAction, type SaveReportState } from "@/lib/actions/report";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Initial = {
  visitorCount: number;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  qrAmount: number;
  comment: string;
};

const emptyInitial: Initial = {
  visitorCount: 0,
  cashAmount: 0,
  cardAmount: 0,
  transferAmount: 0,
  qrAmount: 0,
  comment: "",
};

const initialState: SaveReportState = { success: false };

export default function ReportForm({
  date,
  initial,
  t,
  organizations,
  initialOrgCounts,
}: {
  date: string;
  initial: Initial | null;
  t: Dictionary;
  organizations: { id: string; name: string }[];
  initialOrgCounts: Record<string, number>;
}) {
  const values = initial ?? emptyInitial;
  const [state, formAction, pending] = useActionState(
    saveReportAction,
    initialState,
  );
  const [amounts, setAmounts] = useState({
    cashAmount: values.cashAmount,
    cardAmount: values.cardAmount,
    transferAmount: values.transferAmount,
    qrAmount: values.qrAmount,
  });
  const [orgCounts, setOrgCounts] = useState<Record<string, number>>(() => {
    const initialCounts: Record<string, number> = {};
    for (const org of organizations) {
      initialCounts[org.id] = initialOrgCounts[org.id] ?? 0;
    }
    return initialCounts;
  });

  const total =
    (Number(amounts.cashAmount) || 0) +
    (Number(amounts.cardAmount) || 0) +
    (Number(amounts.transferAmount) || 0) +
    (Number(amounts.qrAmount) || 0);

  const visitorTotal =
    organizations.length > 0
      ? organizations.reduce(
          (sum, org) => sum + (Number(orgCounts[org.id]) || 0),
          0,
        )
      : values.visitorCount;

  const fieldError = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form
      action={formAction}
      key={date}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="date" value={date} />

      {state.error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {t.reportSaved}
        </div>
      )}

      {organizations.length > 0 ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.visitorsByOrganization}
          </label>
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-slate-600">
                  {org.name}
                </span>
                <input
                  type="number"
                  name={`org_${org.id}`}
                  min={0}
                  step={1}
                  value={orgCounts[org.id] ?? 0}
                  onChange={(e) =>
                    setOrgCounts((c) => ({
                      ...c,
                      [org.id]: Number(e.target.value),
                    }))
                  }
                  className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              {t.visitorCount}
            </span>
            <span className="font-semibold text-slate-900">
              {visitorTotal}
            </span>
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {t.visitorCount}
          </label>
          <input
            type="number"
            name="visitorCount"
            min={0}
            step={1}
            defaultValue={values.visitorCount}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          {fieldError("visitorCount") && (
            <p className="mt-1 text-xs text-red-600">
              {fieldError("visitorCount")}
            </p>
          )}
        </div>
      )}

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

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {t.comment}
        </label>
        <textarea
          name="comment"
          rows={3}
          defaultValue={values.comment}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
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
