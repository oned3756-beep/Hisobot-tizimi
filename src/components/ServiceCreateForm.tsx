"use client";

import { useActionState } from "react";
import { createServiceAction, type ServiceFormState } from "@/lib/actions/services";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: ServiceFormState = { success: false };

export default function ServiceCreateForm({
  objects,
  t,
}: {
  objects: { id: string; nameUz: string }[];
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    createServiceAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.object}
        </label>
        <select
          name="objectId"
          required
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="">{t.selectObject}</option>
          {objects.map((obj) => (
            <option key={obj.id} value={obj.id}>
              {obj.nameUz}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.serviceName}
        </label>
        <input
          name="name"
          required
          placeholder="masalan: Kattalar chiptasi"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.price}
        </label>
        <input
          name="price"
          type="number"
          required
          min={0}
          step="0.01"
          className="w-32 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? t.adding : t.addService}
      </button>

      {state.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="w-full text-sm text-green-600">{t.serviceAdded}</p>
      )}
    </form>
  );
}
