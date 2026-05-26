"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";
import { saveAutoInvestStrategyAction } from "@/app/actions/lend";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="cb-btn-lime w-full disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? "Saving..." : "Save strategy"}
    </button>
  );
}

export default function AutoInvestPage() {
  const [state, action] = useActionState(saveAutoInvestStrategyAction, { error: "" } as any);

  return (
    <div className="dash-root -mx-4 sm:-mx-6 -my-8 sm:-my-10 px-4 sm:px-8 py-8 sm:py-10 overflow-hidden min-h-[calc(100vh-68px)]">
      <div aria-hidden className="dash-orb dash-orb-blue" style={{ width: 520, height: 520, top: -180, right: -120 }} />
      <div aria-hidden className="dash-orb dash-orb-cyan" style={{ width: 460, height: 460, bottom: -200, left: -160 }} />

      <div className="relative z-10 max-w-lg mx-auto space-y-4">
        <header className="space-y-2">
          <span className="dash-kicker">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--cb-sky)] align-middle mr-2 shadow-[0_0_12px_var(--cb-sky-glow)]" />
            Auto-Invest
          </span>
          <h1 className="cb-display text-[28px] sm:text-[36px] font-bold text-[var(--cb-text)] inline-flex items-center gap-2">
            <Sparkles size={26} className="text-[var(--cb-sky)]" /> Auto-Invest strategy
          </h1>
          <p className="text-sm text-[var(--cb-text-muted)]">
            When a new loan request matches your criteria, an offer will be submitted automatically using your wallet balance.
          </p>
        </header>

        <form action={action} className="dash-card glass-input space-y-3 p-5 sm:p-6">
          <div>
            <label htmlFor="name">Strategy name</label>
            <input id="name" name="name" required defaultValue="Conservative NCI" />
          </div>
          <div>
            <label htmlFor="min_score">Minimum borrower score</label>
            <input id="min_score" name="min_score" type="number" min={0} max={100} required defaultValue={65} className="cb-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="min_apr_pct">Min APR (%)</label>
              <input id="min_apr_pct" name="min_apr_pct" type="number" min={0} max={12} step={0.1} required defaultValue={6} className="cb-mono" />
            </div>
            <div>
              <label htmlFor="max_apr_pct">Max APR (%)</label>
              <input id="max_apr_pct" name="max_apr_pct" type="number" min={0} max={12} step={0.1} required defaultValue={10} className="cb-mono" />
            </div>
          </div>
          <div>
            <label htmlFor="max_term_months">Max term (months)</label>
            <input id="max_term_months" name="max_term_months" type="number" min={1} max={12} required defaultValue={6} className="cb-mono" />
          </div>
          <div>
            <label htmlFor="investment_per_loan_eur">Investment per loan (EUR)</label>
            <input id="investment_per_loan_eur" name="investment_per_loan_eur" type="number" min={10} max={2000} required defaultValue={50} className="cb-mono" />
          </div>
          {state?.error && <p className="text-sm text-[#FF8A5B]">{state.error}</p>}
          {state?.ok && <p className="text-sm text-[#4ADE80]">✓ Strategy saved.</p>}
          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}
