"use client";

import { useActionState } from "react";
import {
  updateOrganizationAction,
  toggleOrganizationActiveAction,
  deleteOrganizationAction,
  type OrganizationFormState,
} from "@/lib/actions/organizations";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

const initialState: OrganizationFormState = { success: false };

type ObjectOption = { id: string; nameUz: string };

export default function OrganizationRow({
  organization,
  objects,
  t,
}: {
  organization: {
    id: string;
    nameUz: string;
    nameRu: string;
    slug: string;
    isActive: boolean;
    commissionPercent: number;
    linkedObjectIds: string[];
    soldVouchersCount: number;
    totalCommission: number;
  };
  objects: ObjectOption[];
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    updateOrganizationAction,
    initialState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteOrganizationAction,
    initialState,
  );

  return (
    <tr className="border-b border-slate-100">
      <td className="px-2 py-2">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={organization.id} />
          <input
            name="nameUz"
            defaultValue={organization.nameUz}
            className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            name="nameRu"
            defaultValue={organization.nameRu}
            className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            name="slug"
            defaultValue={organization.slug}
            pattern="[a-z0-9-]+"
            className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            name="commissionPercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue={organization.commissionPercent}
            className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {objects.map((obj) => (
              <label
                key={obj.id}
                className="flex items-center gap-1 text-xs text-slate-600"
              >
                <input
                  type="checkbox"
                  name="objectIds"
                  value={obj.id}
                  defaultChecked={organization.linkedObjectIds.includes(obj.id)}
                  className="rounded border-slate-300"
                />
                {obj.nameUz}
              </label>
            ))}
          </div>
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
            organization.isActive
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {organization.isActive ? t.active : t.inactive}
        </span>
      </td>
      <td className="px-2 py-2 text-slate-600">
        {organization.soldVouchersCount}
      </td>
      <td className="px-2 py-2 font-medium text-slate-900">
        {organization.totalCommission.toLocaleString("en-US")}
      </td>
      <td className="px-2 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <form action={toggleOrganizationActiveAction}>
            <input type="hidden" name="id" value={organization.id} />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
            >
              {organization.isActive ? t.disable : t.enable}
            </button>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={organization.id} />
            <ConfirmSubmitButton
              label={t.delete}
              confirmMessage={t.confirmDelete}
              className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 transition hover:bg-red-50"
            />
          </form>
          {deleteState.error && (
            <span className="w-full text-xs text-red-600">
              {deleteState.error}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
