"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { createLoanRequestAction } from "@/app/actions/borrow";

function SubmitBtn({ disabled }: Readonly<{ disabled: boolean }>) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending || disabled}
      className="cb-btn-lime w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Posting..." : (<>Post loan request <ArrowRight size={16} /></>)}
    </button>
  );
}

export default function BorrowForm({
  maxAmountEur,
  eligible,
}: Readonly<{ maxAmountEur: number; eligible: boolean }>) {
  const [state, action] = useActionState(createLoanRequestAction, { error: "" } as any);

  if (!eligible) {
    return (
      <div className="dash-card p-5 text-sm text-[var(--cb-text-muted)]">
        Your current credit score is below the minimum required to borrow on the platform. Verify your identity, complete your assessment, and build a positive history to unlock borrowing.
      </div>
    );
  }

  return (
    <form action={action} className="dash-card glass-input p-6 sm:p-8 space-y-5">
      <div>
        <label htmlFor="amount_eur">Amount (EUR, max €{maxAmountEur})</label>
        <input
          id="amount_eur"
          name="amount_eur"
          type="number"
          min={100}
          max={maxAmountEur}
          step={10}
          required
          defaultValue={Math.min(500, maxAmountEur)}
          className="cb-mono"
        />
      </div>
      <div>
        <label htmlFor="purpose">Purpose</label>
        <select id="purpose" name="purpose" required>
          <option value="emergency">Emergency</option>
          <option value="laptop_equipment">Laptop / equipment</option>
          <option value="tuition_topup">Tuition top-up</option>
          <option value="living_expenses">Living expenses</option>
          <option value="travel_home">Travel home</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="purpose_description">Description (optional)</label>
        <textarea
          id="purpose_description"
          name="purpose_description"
          maxLength={500}
          rows={3}
          placeholder="A few sentences for lenders…"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="term_months">Term (months)</label>
          <input id="term_months" name="term_months" type="number" min={1} max={12} required defaultValue={6} className="cb-mono" />
        </div>
        <div>
          <label htmlFor="max_apr_pct">Max APR you&apos;ll pay (%)</label>
          <input id="max_apr_pct" name="max_apr_pct" type="number" min={1} max={12} step={0.1} required defaultValue={10} className="cb-mono" />
        </div>
      </div>
      {state?.error && (
        <p className="text-sm text-[#FF8A5B] bg-[rgba(255,138,91,0.08)] border border-[rgba(255,138,91,0.30)] rounded-[12px] px-3 py-2">
          {state.error}
        </p>
      )}
      <SubmitBtn disabled={false} />
    </form>
  );
}
