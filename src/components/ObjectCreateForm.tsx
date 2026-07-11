"use client";

import { useActionState } from "react";
import {
  createObjectAction,
  type ObjectFormState,
} from "@/lib/actions/objects";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: ObjectFormState = { success: false };

export default function ObjectCreateForm({ t }: { t: Dictionary }) {
  const [state, formAction, pending] = useActionState(
    createObjectAction,
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
          placeholder="masalan: kafe"
          pattern="[a-z0-9-]+"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {pending ? t.adding : t.addObject}
      </button>

      {state.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="w-full text-sm text-green-600">{t.objectAdded}</p>
      )}
    </form>
  );
}
