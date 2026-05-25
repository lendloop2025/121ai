import Link from "next/link";
import { createService } from "@/lib/db/client";
import { formatEur, formatDate } from "@/lib/utils";

export default async function AdminLoansPage() {
  const svc = createService();
  const { data: loans } = await svc.from("loans")
    .select("id, principal_cents, apr_bps, term_months, status, created_at")
    .order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-4">
      <header>
        <span className="adm-kicker">Portfolio</span>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight">Loans</h1>
      </header>
      <div className="adm-card overflow-x-auto">
        <table className="adm-table">
          <thead>
            <tr><th>ID</th><th>Principal</th><th>Term</th><th>APR</th><th>Status</th><th>Created</th></tr>
          </thead>
          <tbody>
            {loans?.map(l => (
              <tr key={l.id}>
                <td className="adm-mono"><Link href={`/admin/loans/${l.id}`} className="adm-link">{l.id.slice(0, 8)}…</Link></td>
                <td className="adm-mono">{formatEur(l.principal_cents)}</td>
                <td className="text-[var(--adm-text-muted)]">{l.term_months}mo</td>
                <td className="adm-mono">{(l.apr_bps / 100).toFixed(2)}%</td>
                <td><LoanStatusPill status={l.status} /></td>
                <td className="text-[var(--adm-text-muted)]">{formatDate(l.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoanStatusPill({ status }: { status: string }) {
  const tone = status === "active" || status === "paid_off"
    ? "adm-pill-good"
    : status === "in_grace" || status.startsWith("pending")
    ? "adm-pill-warn"
    : status === "defaulted" || status === "cancelled"
    ? "adm-pill-danger"
    : "";
  return <span className={`adm-pill ${tone}`}>{status.replace(/_/g, " ")}</span>;
}
