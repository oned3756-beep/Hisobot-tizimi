"use client";

import { useActionState } from "react";
import {
  resetPasswordAction,
  toggleUserActiveAction,
  type UserFormState,
} from "@/lib/actions/users";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const initialState: UserFormState = { success: false };

export default function UserRow({
  user,
  t,
}: {
  user: {
    id: string;
    username: string;
    role: "ADMIN" | "STAFF" | "CASHIER";
    isActive: boolean;
    objectName: string | null;
  };
  t: Dictionary;
}) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <tr className="border-b border-slate-100">
      <td className="px-2 py-2 text-slate-800">{user.username}</td>
      <td className="px-2 py-2 text-slate-600">
        {user.role === "ADMIN"
          ? t.admin
          : user.role === "CASHIER"
            ? t.roleCashier
            : user.objectName}
      </td>
      <td className="px-2 py-2 text-center">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            user.isActive
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {user.isActive ? t.active : t.inactive}
        </span>
      </td>
      <td className="px-2 py-2">
        <form
          action={formAction}
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="userId" value={user.id} />
          <input
            name="password"
            type="text"
            placeholder={t.newPassword}
            minLength={6}
            className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            {t.changePassword}
          </button>
          {state.error && (
            <span className="text-xs text-red-600">{state.error}</span>
          )}
        </form>
      </td>
      <td className="px-2 py-2">
        <form action={toggleUserActiveAction}>
          <input type="hidden" name="id" value={user.id} />
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
          >
            {user.isActive ? t.disable : t.enable}
          </button>
        </form>
      </td>
    </tr>
  );
}
