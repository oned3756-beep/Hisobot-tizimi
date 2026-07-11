"use client";

import { useActionState } from "react";
import {
  updateObjectAction,
  toggleObjectActiveAction,
  type ObjectFormState,
} from "@/lib/actions/objects";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: ObjectFormState = { success: false };

export default function ObjectRow({
  object,
  t,
}: {
  object: {
    id: string;
    nameUz: string;
    nameRu: string;
    slug: string;
    isActive: boolean;
  };
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    updateObjectAction,
    initialState,
  );

  return (
    <tr className="border-b border-slate-100">
      <td className="px-2 py-2">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={object.id} />
          <input
            name="nameUz"
            defaultValue={object.nameUz}
            className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            name="nameRu"
            defaultValue={object.nameRu}
            className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            name="slug"
            defaultValue={object.slug}
            pattern="[a-z0-9-]+"
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
            object.isActive
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {object.isActive ? t.active : t.inactive}
        </span>
      </td>
      <td className="px-2 py-2">
        <form action={toggleObjectActiveAction}>
          <input type="hidden" name="id" value={object.id} />
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
          >
            {object.isActive ? t.disable : t.enable}
          </button>
        </form>
      </td>
    </tr>
  );
}
