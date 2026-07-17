"use client";

import { useActionState } from "react";
import {
  createOrganizationAction,
  type OrganizationFormState,
} from "@/lib/actions/organizations";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: OrganizationFormState = { success: false };

type ObjectOption = { id: string; nameUz: string };

export default function OrganizationCreateForm({
  t,
  objects,
}: {
  t: Dictionary;
  objects: ObjectOption[];
}) {
  const [state, formAction, pending] = useActionState(
    createOrganizationAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.nameUz}
        </label>
        <input
          name="nameUz"
          required
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.nameRu}
        </label>
        <input
          name="nameRu"
          required
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.slug}
        </label>
        <input
          name="slug"
          required
          placeholder="masalan: abc-tour"
          pattern="[a-z0-9-]+"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.commissionPercent}
        </label>
        <input
          name="commissionPercent"
          type="number"
          required
          min={0}
          max={100}
          step="0.01"
          defaultValue={20}
          className="w-24 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="mb-1 block w-full text-xs font-medium text-slate-500">
          {t.appliesToObjects}
        </span>
        {objects.map((obj) => (
          <label
            key={obj.id}
            className="flex items-center gap-1.5 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              name="objectIds"
              value={obj.id}
              className="rounded border-slate-300"
            />
            {obj.nameUz}
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? t.adding : t.addOrganization}
      </button>

      {state.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="w-full text-sm text-green-600">{t.organizationAdded}</p>
      )}
    </form>
  );
}
