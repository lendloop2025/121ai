import { requireVerified } from "@/lib/auth/session";
import { createService } from "@/lib/db/client";
import { formatEur, formatDate } from "@/lib/utils";

export default async function TransactionsPage() {
  const { user } = await requireVerified();
  const svc = createService();
  const { data: ledger } = await svc.from("ledger").select("*").eq("user_id", user.id)
    .order("created_at", { ascending: false }).limit(100);

  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden min-h-[calc(100vh-68px)]">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />

      <div className="relative z-10 space-y-4">
        <header className="space-y-1">
          <span className="dash-kicker">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] align-middle mr-2 shadow-[0_0_12px_var(--cb-sky-glow)]" />
            Activity
          </span>
          <h1 className="cb-display text-[28px] sm:text-[36px] font-bold text-[var(--cb-text)]">Transactions</h1>
        </header>

        <div className="dash-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--cb-text-subtle)] border-b border-[var(--cb-border)]">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 text-right font-medium">Amount</th>
                <th className="p-3 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger?.map(l => (
                <tr key={l.id} className="border-t border-[var(--cb-border)] hover:bg-white/[0.02]">
                  <td className="p-3 whitespace-nowrap text-[var(--cb-text-muted)]">{formatDate(l.created_at)}</td>
                  <td className="p-3 capitalize text-[var(--cb-text)]">{l.entry_type.replace(/_/g, " ")}</td>
                  <td className="p-3 text-[var(--cb-text-muted)]">{l.description ?? "—"}</td>
                  <td className={`p-3 text-right font-mono ${l.amount_cents >= 0 ? "dash-amt-pos" : "dash-amt-neg"}`}>
                    {l.amount_cents >= 0 ? "+" : ""}{formatEur(l.amount_cents)}
                  </td>
                  <td className="p-3 text-right font-mono text-[var(--cb-text)]">{formatEur(l.balance_after_cents)}</td>
                </tr>
              ))}
              {(!ledger || ledger.length === 0) && (
                <tr><td colSpan={5} className="p-6 text-center text-[var(--cb-text-muted)]">No transactions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
