"use client";
import { Suspense, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { ArrowDownToLine, ArrowRight, Info, ShieldCheck, XCircle } from "lucide-react";
import { createDepositSessionAction } from "@/app/actions/wallet";

const QUICK_AMOUNTS = [25, 50, 100, 250, 500];

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="cb-btn-lime w-full disabled:opacity-50 disabled:cursor-not-allowed">
      {pending ? (
        "Redirecting to Stripe…"
      ) : (
        <>
          Continue to payment
          <ArrowRight size={18} />
        </>
      )}
    </button>
  );
}

export default function DepositPage() {
  return (
    <Suspense>
      <DepositForm />
    </Suspense>
  );
}

function DepositForm() {
  const [state, action] = useActionState(createDepositSessionAction, { url: "", error: "" } as any);
  const [amount, setAmount] = useState<number>(100);
  const params = useSearchParams();
  const cancelled = params.get("cancelled") === "1";

  useEffect(() => {
    if (state?.url) window.location.href = state.url;
  }, [state]);

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Dark cracker-theme panel — matches the landing page aesthetic */}
      <div className="cracker-root relative overflow-hidden rounded-[24px] border border-[var(--cb-border)] bg-[var(--cb-bg)] p-7 sm:p-9">
        <div aria-hidden className="absolute inset-0 cb-bg-grid opacity-60" />
        <div
          aria-hidden
          className="cb-lime-glow"
          style={{ width: 380, height: 380, top: -140, right: -120 }}
        />

        <div className="relative z-10 space-y-6">
          <header className="space-y-3">
            <span className="cb-badge">
              <span className="dot" />
              Sandbox · test mode
            </span>
            <div className="inline-flex items-center justify-center size-11 rounded-[14px] border border-[var(--cb-border-strong)] bg-[var(--cb-surface-2)] text-[var(--cb-sky)]">
              <ArrowDownToLine className="size-5" />
            </div>
            <h1 className="cb-display text-[34px] text-[var(--cb-text)]">Deposit funds</h1>
            <p className="text-[15px] leading-relaxed text-[var(--cb-text-muted)]">
              Top up your wallet to start lending. Funds appear once your payment clears.
            </p>
          </header>

          {cancelled && (
            <div className="flex items-start gap-3 rounded-[16px] border border-[var(--cb-border)] bg-[var(--cb-surface-2)] p-4 text-sm">
              <XCircle className="size-5 shrink-0 text-[var(--danger)]" />
              <p className="text-[var(--cb-text-muted)]">
                Payment was cancelled — your wallet hasn’t been charged. You can try again below.
              </p>
            </div>
          )}

          <form action={action} className="space-y-5">
            <div className="glass-input">
              <label htmlFor="amount_eur">Amount</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-medium text-[var(--cb-text-muted)]">
                  €
                </span>
                <input
                  id="amount_eur"
                  name="amount_eur"
                  type="number"
                  min={10}
                  max={2000}
                  step={0.01}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="!pl-8 cb-mono"
                />
              </div>
              <p className="mt-1.5 text-[13px] text-[var(--cb-text-subtle)]">Min €10 · Max €2,000</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((v) => {
                const active = amount === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold cb-mono transition ${
                      active
                        ? "border-[var(--cb-lime)] bg-[var(--cb-lime-soft)] text-[var(--cb-lime)]"
                        : "border-[var(--cb-border-strong)] text-[var(--cb-text-muted)] hover:border-[var(--cb-lime)] hover:text-[var(--cb-lime)]"
                    }`}
                  >
                    €{v}
                  </button>
                );
              })}
            </div>

            {state?.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}

            <SubmitBtn />
          </form>

          <div className="flex items-center justify-center gap-2 text-[13px] text-[var(--cb-text-subtle)]">
            <ShieldCheck className="size-4" />
            Secured by Stripe
          </div>
        </div>
      </div>

      {/* Sandbox / test-card help */}
      <div className="flex items-start gap-3 rounded-[20px] border border-[var(--cb-border)] bg-[var(--cb-surface)] p-4 text-sm">
        <Info className="size-5 shrink-0 text-[var(--cb-sky)]" />
        <div className="space-y-1 text-[var(--cb-text-muted)]">
          <p className="font-semibold text-[var(--cb-text)]">Sandbox / test mode</p>
          <p>
            No real money moves. Use card{" "}
            <code className="rounded bg-[var(--cb-surface-2)] px-1.5 py-0.5 font-mono text-[var(--cb-text)] border border-[var(--cb-border)]">
              4242 4242 4242 4242
            </code>
            , any future expiry, and any CVC.
          </p>
        </div>
      </div>
    </div>
  );
}
