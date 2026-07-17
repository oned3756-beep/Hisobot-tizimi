"use client";

import { useActionState } from "react";
import {
  updateServiceAction,
  toggleServiceActiveAction,
  deleteServiceAction,
  type ServiceFormState,
} from "@/lib/actions/services";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

const initialState: ServiceFormState = { success: false };

export default function ServiceRow({
  service,
  objectName,
  t,
}: {
  service: {
    id: string;
    objectId: string;
    name: string;
    price: number;
    isActive: boolean;
  };
  objectName: string;
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    updateServiceAction,
    initialState,
  );

  return (
    <tr className="border-b border-slate-100">
      <td className="px-2 py-2 text-slate-600">{objectName}</td>
      <td className="px-2 py-2">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={service.id} />
          <input type="hidden" name="objectId" value={service.objectId} />
          <input
            name="name"
            defaultValue={service.name}
            className="w-40 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={service.price}
            className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {t.save}
          </button>
          {state.error && (
            <span className="text-xs text-red-600">{state.error}</span>
          )}
        </form>
      </td>
      <td className="px-2 py-2 text-center">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            service.isActive
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {service.isActive ? t.active : t.inactive}
        </span>
      </td>
      <td className="px-2 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <form action={toggleServiceActiveAction}>
            <input type="hidden" name="id" value={service.id} />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
            >
              {service.isActive ? t.disable : t.enable}
            </button>
          </form>
          <form action={deleteServiceAction}>
            <input type="hidden" name="id" value={service.id} />
            <ConfirmSubmitButton
              label={t.delete}
              confirmMessage={t.confirmDelete}
              className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 transition hover:bg-red-50"
            />
          </form>
        </div>
      </td>
    </tr>
  );
}
