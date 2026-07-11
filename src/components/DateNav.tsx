"use client";

import { useRouter } from "next/navigation";

export default function DateNav({
  date,
  basePath,
}: {
  date: string;
  basePath: string;
}) {
  const router = useRouter();

  return (
    <input
      type="date"
      defaultValue={date}
      onChange={(e) => {
        if (e.target.value) {
          router.push(`${basePath}?date=${e.target.value}`);
        }
      }}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
    />
  );
}
