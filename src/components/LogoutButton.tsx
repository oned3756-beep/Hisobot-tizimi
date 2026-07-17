import { signOut } from "@/lib/auth";
import SubmitButton from "@/components/SubmitButton";

export default function LogoutButton({ label }: { label: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <SubmitButton
        label={label}
        pendingLabel="..."
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
      />
    </form>
  );
}
