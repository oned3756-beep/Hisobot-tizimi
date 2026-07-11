import type { Dictionary } from "@/lib/i18n/dictionaries";

type ObjectOption = { id: string; nameUz: string };

export default function AdminFilters({
  from,
  to,
  selectedIds,
  objects,
  t,
}: {
  from: string;
  to: string;
  selectedIds: string[];
  objects: ObjectOption[];
  t: Dictionary;
}) {
  return (
    <form
      method="GET"
      className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.fromDate}
        </label>
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">
          {t.toDate}
        </label>
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <span className="mb-1 block w-full text-xs font-medium text-slate-500">
          {t.objectsLabel}
        </span>
        {objects.map((obj) => (
          <label
            key={obj.id}
            className="flex items-center gap-1.5 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              name="objects"
              value={obj.id}
              defaultChecked={
                selectedIds.length === 0 || selectedIds.includes(obj.id)
              }
              className="rounded border-slate-300"
            />
            {obj.nameUz}
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        {t.filter}
      </button>
    </form>
  );
}
