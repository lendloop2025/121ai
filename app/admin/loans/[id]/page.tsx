import { createService } from "@/lib/db/client";
import { formatEur, formatBps, formatDate } from "@/lib/utils";
import { timeWarpLoanAction } from "@/app/actions/admin";

export default async function AdminLoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const svc = createService();
  const { data: loan } = await svc.from("loans").select("*").eq("id", id).single();
  if (!loan) return <p>Not found.</p>;
  const { data: repayments } = await svc.from("repayments").select("*").eq("loan_id", id).order("sequence_number");

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <header>
        <span className="adm-kicker">Loan dossier</span>
        <h1 className="mt-1 text-[26px] font-bold tracking-tight adm-mono">Loan {id.slice(0, 8)}</h1>
      </header>

      <div className="adm-card adm-card-rule p-5">
        <div className="text-3xl font-bold adm-mono text-[var(--adm-text)]">{formatEur(loan.principal_cents)}</div>
        <div className="text-sm text-[var(--adm-text-muted)] mt-1">{formatBps(loan.apr_bps)} · {loan.term_months}mo · {formatEur(loan.monthly_payment_cents)}/mo</div>
        <div className="mt-2"><span className="adm-pill">{loan.status.replace(/_/g, " ")}</span></div>
      </div>

      <div className="adm-card p-5" style={{ borderColor: "rgba(255,179,91,0.35)" }}>
        <h2 className="adm-kicker mb-3" style={{ color: "var(--adm-amber)" }}>Demo helpers</h2>
        <form action={timeWarpLoanAction} className="flex flex-wrap gap-3 items-end">
          <input type="hidden" name="loan_id" value={loan.id} />
          <div>
            <label className="adm-kicker block mb-1.5">Advance time by (months)</label>
            <input name="months" type="number" min={1} max={12} defaultValue={1} className="adm-input !w-28" />
          </div>
          <button className="adm-btn-approve" style={{ background: "linear-gradient(180deg, var(--adm-amber), var(--adm-orange))", color: "#1A0A04" }}>
            Time-warp &amp; process repayments
          </button>
        </form>
        <p className="text-xs text-[var(--adm-text-subtle)] mt-3">Backdates the next due date(s) and runs the repayment processor immediately.</p>
      </div>

      <h2 className="adm-kicker pt-2">Repayments</h2>
      <div className="adm-card overflow-x-auto">
        <table className="adm-table">
          <thead>
            <tr><th>#</th><th>Due</th><th className="!text-right">Total</th><th className="!text-right">Status</th></tr>
          </thead>
          <tbody>
            {repayments?.map(r => (
              <tr key={r.id}>
                <td className="adm-mono">{r.sequence_number}</td>
                <td className="text-[var(--adm-text-muted)]">{formatDate(r.due_date)}</td>
                <td className="adm-mono text-right">{formatEur(r.total_due_cents)}</td>
                <td className="text-right capitalize text-[var(--adm-text-muted)]">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
