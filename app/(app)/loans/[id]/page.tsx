import Link from "next/link";
import { requireVerified } from "@/lib/auth/session";
import { createService } from "@/lib/db/client";
import { formatEur, formatBps, formatDate } from "@/lib/utils";
import { previewEarlyPayoff } from "@/app/actions/repayment";
import EarlyPayoffButton from "./early-payoff-button";

function DarkStage({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden min-h-[calc(100vh-68px)]">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default async function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireVerified();
  const svc = createService();

  const { data: loan } = await svc.from("loans").select("*").eq("id", id).single();
  if (!loan || (loan.borrower_id !== user.id && loan.lender_id !== user.id)) {
    return <DarkStage><p className="text-sm text-[#FF8A5B]">Loan not found.</p></DarkStage>;
  }
  const { data: repayments } = await svc.from("repayments").select("*").eq("loan_id", id).order("sequence_number");

  const isBorrower = loan.borrower_id === user.id;
  const canPayOff = isBorrower && (loan.status === "active" || loan.status === "in_grace");
  const payoff = canPayOff ? await previewEarlyPayoff(id) : null;

  return (
    <DarkStage>
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="cb-display text-[28px] sm:text-[34px] font-bold text-[var(--cb-text)]">Loan details</h1>

        <div className="dash-card p-5">
          <div className="text-2xl font-bold tabular text-[var(--cb-text)]">{formatEur(loan.principal_cents)}</div>
          <div className="text-sm text-[var(--cb-text-muted)]">{formatBps(loan.apr_bps)} APR · {loan.term_months} months · {formatEur(loan.monthly_payment_cents)}/mo</div>
          <div className="text-xs text-[var(--cb-text-subtle)] mt-2">Status: <span className="font-semibold capitalize text-[var(--cb-text-muted)]">{loan.status.replaceAll("_", " ")}</span></div>
          <div className="text-xs text-[var(--cb-text-subtle)]">You are the {isBorrower ? "borrower" : "lender"}.</div>
        </div>

        {loan.status === "pending_signature" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href={`/agreements/${loan.id}/sign`} className="cb-btn-lime justify-center">
              Review & sign agreement
            </Link>
            <a
              href={`/api/agreements/${loan.id}/pdf?download=1`}
              download={`loan-agreement-${loan.id.slice(0, 8)}.pdf`}
              className="cb-btn-ghost justify-center"
            >
              Download draft (PDF)
            </a>
          </div>
        )}

        {canPayOff && payoff && (
          <div className="dash-card p-5 space-y-2">
            <h2 className="font-bold text-[var(--cb-text)]">Pay off loan early</h2>
            <div className="text-sm text-[var(--cb-text-muted)]">
              Closing early settles the full remaining principal plus the entire interest you originally agreed to pay.
              The loan is contracted as a fixed-return product to your lender — closing early shortens the term but
              does not reduce the interest. Your credit score updates immediately on closure.
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm pt-1">
              <div>
                <div className="dash-kicker">Remaining principal</div>
                <div className="font-semibold tabular text-[var(--cb-text)] mt-0.5">{formatEur(payoff.remainingPrincipal)}</div>
              </div>
              <div>
                <div className="dash-kicker">Interest still owed</div>
                <div className="font-semibold tabular text-[var(--cb-text)] mt-0.5">{formatEur(payoff.remainingInterest)}</div>
              </div>
              <div>
                <div className="dash-kicker">Total payoff</div>
                <div className="font-semibold tabular text-[var(--cb-sky)] mt-0.5">{formatEur(payoff.total)}</div>
              </div>
            </div>
            <EarlyPayoffButton loanId={id} totalEur={(payoff.total / 100).toFixed(2)} />
          </div>
        )}

        <h2 className="font-bold text-[var(--cb-text)] pt-2">Repayment schedule</h2>
        <div className="dash-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--cb-text-subtle)] border-b border-[var(--cb-border)]">
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">Due</th>
                <th className="p-3 text-right font-medium">Total</th>
                <th className="p-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {repayments?.map(r => (
                <tr key={r.id} className="border-t border-[var(--cb-border)]">
                  <td className="p-3 tabular text-[var(--cb-text-muted)]">{r.sequence_number}</td>
                  <td className="p-3 tabular text-[var(--cb-text-muted)]">{formatDate(r.due_date)}</td>
                  <td className="p-3 text-right tabular text-[var(--cb-text)]">{formatEur(r.total_due_cents)}</td>
                  <td className="p-3 text-right capitalize">
                    {r.status === "paid" && <span className="text-[#4ADE80]">✓ Paid</span>}
                    {r.status === "scheduled" && <span className="text-[var(--cb-text-subtle)]">Scheduled</span>}
                    {r.status === "late" && <span className="text-[#FACC15]">Late</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <a
          href={`/api/agreements/${loan.id}/pdf?download=1`}
          download={`loan-agreement-${loan.id.slice(0, 8)}.pdf`}
          className="inline-block text-sm text-[var(--cb-sky)] hover:underline"
        >
          Download {loan.borrower_signed_at && loan.lender_signed_at ? "signed " : ""}agreement (PDF)
        </a>
      </div>
    </DarkStage>
  );
}
