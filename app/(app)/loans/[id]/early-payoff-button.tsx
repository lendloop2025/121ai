"use client";
import { useTransition, useState } from "react";
import { earlyPayoffAction } from "@/app/actions/repayment";

export default function EarlyPayoffButton({ loanId, totalEur }: { loanId: string; totalEur: string }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        const ok = window.confirm(
          `Pay off this loan now for €${totalEur}? The full amount will be debited from your wallet immediately.`,
        );
        if (!ok) return;
        start(async () => {
          try {
            await earlyPayoffAction(fd);
          } catch (e: any) {
            setErr(e?.message ?? "Payoff failed.");
          }
        });
      }}
    >
      <input type="hidden" name="loan_id" value={loanId} />
      <button
        disabled={pending}
        className="cb-btn-lime w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Processing..." : `Pay off €${totalEur} now`}
      </button>
      {err && <p className="text-sm text-[#FF8A5B] mt-2">{err}</p>}
    </form>
  );
}
