"use client";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { counterOfferAction } from "@/app/actions/borrow";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="dash-btn !h-9 !px-4 text-sm disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send counter"}
    </button>
  );
}

export default function CounterOfferForm({
  offerId,
  defaultAmountEur,
  defaultAprPct,
  defaultTermMonths,
  maxAmountEur,
  maxAprPct,
}: {
  offerId: string;
  defaultAmountEur: number;
  defaultAprPct: number;
  defaultTermMonths: number;
  maxAmountEur: number;
  maxAprPct: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(counterOfferAction, { error: "" } as any);

  // Re-fetch the parent server component when the counter is accepted so the
  // original offer flips to "Superseded by your counter" and Accept disappears.
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state?.ok, router]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="dash-btn-ghost !h-9 !px-4 text-sm"
      >
        Counter offer
      </button>
    );
  }

  if (state?.ok) {
    return (
      <span className="text-sm text-[#4ADE80] font-semibold">
        Counter sent — waiting on lender
      </span>
    );
  }

  return (
    <form action={action} className="glass-input space-y-2 mt-3 p-3 rounded-xl w-full border border-[var(--cb-border)] bg-white/[0.03]">
      <input type="hidden" name="offer_id" value={offerId} />
      <div className="grid grid-cols-3 gap-2">
        <label className="text-xs">
          <span className="text-[var(--cb-text-subtle)]">Amount (€)</span>
          <input
            name="amount_eur" type="number" step="1" min="10" max={maxAmountEur}
            defaultValue={defaultAmountEur}
            className="!h-9 !px-2 mt-1 cb-mono text-sm"
          />
        </label>
        <label className="text-xs">
          <span className="text-[var(--cb-text-subtle)]">APR (%)</span>
          <input
            name="apr_pct" type="number" step="0.1" min="1" max={maxAprPct}
            defaultValue={defaultAprPct}
            className="!h-9 !px-2 mt-1 cb-mono text-sm"
          />
        </label>
        <label className="text-xs">
          <span className="text-[var(--cb-text-subtle)]">Term (mo)</span>
          <input
            name="term_months" type="number" step="1" min="1" max="12"
            defaultValue={defaultTermMonths}
            className="!h-9 !px-2 mt-1 cb-mono text-sm"
          />
        </label>
      </div>
      <textarea
        name="message"
        placeholder="Optional note to the lender"
        maxLength={500}
        className="!px-2 !py-1.5 text-sm"
        rows={2}
      />
      {state?.error && <p className="text-xs text-[#FF8A5B]">{state.error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded-md text-sm text-[var(--cb-text-muted)] hover:text-[var(--cb-text)]"
        >
          Cancel
        </button>
        <Submit />
      </div>
    </form>
  );
}
